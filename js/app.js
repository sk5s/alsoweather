// declare keys

// api key
// now in key.js

// api url
const CWB_API = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${CWB_KEY}&format=JSON`
// api url
const QUOTE_API = `https://api.quotable.io/random`

// accept speech lang (lower case)
let accept_speech_lang = ['zh-TW', 'en-US']

let default_prompt_last_time = 3000

// variable to replace by javascript
let cwb_location_select_value = ''
let stored_speech_voice = ''

let voices = []
let available_and_accept_speech_voice = []
let speech_script = {
  'zh-TW': '',
  'en-US': '',
}

let populated_voice_select //html object
let darkmode //darkmode object

// grab html dom element
let html = document.getElementById('html')
let cwb_location_select = document.getElementById('cwb_location_select')
let lang_select = document.getElementById('lang_select')
let quote_block_inner_content = document.getElementById('quote_block_inner_content')
let weather_block_inner_content = document.getElementById('weather_block_inner_content')
let weather_chart_inner_content = document.getElementById('weather_chart_inner_content')
let speechSynthesis_container = document.getElementById('speechSynthesis_container')
let speechSynthesis_config_container = document.getElementById('speechSynthesis_config_container')
let prompt_modal_container = document.getElementById('prompt_modal_container')

// because init problem in some browser
let i18next_script = document.getElementById('i18next_script')

let weather_chart_canvas = document.getElementById('weather_chart_canvas')

// event
cwb_location_select.addEventListener('input', location_input_service)
lang_select.addEventListener('input', lang_input_service)

// init
document.addEventListener('DOMContentLoaded', () => {
  first_time_tour()
  restore_location()
  restore_speech_voice()
  restore_app_lang()
  i18n_init()
  darkmode_init()
  fresh()
  speech_synthesis_init()

  setTimeout(() => {
    if (!i18next.translator) {
      i18n_init()
    }
  }, 500)
})

// service worker
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker
//     .register('../sw.js')
//     .then((registration) => {
//       console.log('sw registered!')
//       console.log(registration)
//     })
//     .catch((error) => {
//       console.log('sw error: ' + error)
//     })
// }

function first_time_tour() {
  if (localStorage.getItem('alsoweather_app_seen_tour') == null) {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shadow-md bg-purple-dark',
        scrollTo: true,
      },
      confirmCancel: true,
    })
    tour.addStep({
      text: '由此查看當時段的天氣情況',
      attachTo: {
        element: '#step1',
        on: 'top',
      },
      buttons: [
        {
          text: 'Exit Tour',
          action: tour.cancel,
        },
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    })
    // tour.addStep({
    //   text: '點擊重新整理天氣資料',
    //   attachTo: {
    //     element: '#refresh_button',
    //     on: 'top',
    //   },
    //   scrollTo: false,
    //   buttons: [
    //     {
    //       text: 'Next',
    //       action: tour.next,
    //     },
    //   ],
    // })
    tour.addStep({
      text: '點擊此按鈕可以到一周天氣的頁面',
      attachTo: {
        element: '#week_forecast_button',
        on: 'top',
      },
      scrollTo: false,
      buttons: [
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    })
    tour.addStep({
      text: '由此查看接下來36小時的最高最低溫',
      attachTo: {
        element: '#step2',
        on: 'bottom',
      },
      buttons: [
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    })
    let config_click_count = 0

    const myClick = () => {
      config_click_count++
      if (config_click_count == 2) {
        // to remove
        document.getElementById('configButton').removeEventListener('click', myClick)
      } else {
        tour.next()
      }
    }
    document.getElementById('configButton').addEventListener('click', myClick)
    tour.addStep({
      text: '點擊設定來調整地區',
      attachTo: {
        element: '#configButton',
        on: 'top',
      },
    })
    tour.addStep({
      text: '選取地區',
      attachTo: {
        element: '#cwb_location_select',
        on: 'bottom',
      },
      scrollTo: false,
      buttons: [
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    })
    // tour.addStep({
    //   text: '切換語言',
    //   attachTo: {
    //     element: '#lang_select',
    //     on: 'bottom',
    //   },
    //   scrollTo: false,
    //   buttons: [
    //     {
    //       text: 'Complete',
    //       action: tour.next,
    //     },
    //   ],
    // })
    tour.start()
    tour.on('cancel', () => {
      document.getElementById('configButton').removeEventListener('click', myClick)
    })
    localStorage.setItem('alsoweather_app_seen_tour', 'true')
  }
}
function see_tour_again() {
  localStorage.removeItem('alsoweather_app_seen_tour')
  window.location.reload()
}

// html changed service
function html_changed() {
  i18n_refresh()
}

// fetch cwb api
async function fetch_cwb(url) {
  try {
    await fetch(url, {
      method: 'GET',
    })
      .then((data) => {
        return data.json()
      })
      .then((data) => {
        // add location select option
        let options = generate_location_option(data.records.location)
        fillin_location_select_options(options)
        return data.records.location
      })
      .then((data) => {
        let location_index = find_location_index(data, cwb_location_select_value)
        if (location_index == -1) {
          alert_modal('location error! Please choose new one', default_prompt_last_time)
        }
        return { data, location_index }
      })
      .then((data_all) => {
        let parsed_cwb_data = {
          now: {},
        }
        // now
        parsed_cwb_data.now.Wx =
          data_all.data[data_all.location_index].weatherElement[0].time[0].parameter.parameterName
        parsed_cwb_data.now.PoP =
          data_all.data[data_all.location_index].weatherElement[1].time[0].parameter.parameterName
        parsed_cwb_data.now.MinT =
          data_all.data[data_all.location_index].weatherElement[2].time[0].parameter.parameterName
        parsed_cwb_data.now.CI =
          data_all.data[data_all.location_index].weatherElement[3].time[0].parameter.parameterName
        parsed_cwb_data.now.MaxT =
          data_all.data[data_all.location_index].weatherElement[4].time[0].parameter.parameterName
        // 3day
        generate_weather_chart_data(data_all.data[data_all.location_index].weatherElement)
        fillin_weather(generate_now_weather(parsed_cwb_data.now))
        generate_now_weather_speech_script(parsed_cwb_data.now)
        let whatToWear = document.getElementById('whatToWear')
        whatToWear.innerHTML = `<i class="fas fa-comment-alt"></i> `
        whatToWear.innerHTML += whatToWearNow(
          parsed_cwb_data.now.MaxT,
          parsed_cwb_data.now.MinT,
          parsed_cwb_data.now.PoP
        )
      })
  } catch (error) {
    console.log(error)
    alert_modal(error.message, default_prompt_last_time)
  }
}

// fetch quote
async function fetch_quote(url) {
  try {
    await fetch(url, {
      method: 'GET',
    })
      .then((data) => {
        return data.json()
      })
      .then((data) => {
        fillin_quote(data)
      })
  } catch (error) {
    // alert_modal(error.message, default_prompt_last_time)
  }
}

// find location index
function find_location_index(element, locationNametosearch) {
  let locationNameIndex = -1 //-1表示未找到
  for (let i = 0; i < element.length; i++) {
    let locationName = element[i].locationName
    if (locationNametosearch == locationName) {
      locationNameIndex = i
    }
  }
  return locationNameIndex
}

// input service
function location_input_service() {
  cwb_location_select_value = cwb_location_select.value
  refresh_all()
  console.log(cwb_location_select_value)
  localStorage.setItem('alsoweather_weather_location', cwb_location_select_value)
}
function lang_input_service() {
  user_selected_lang = lang_select.value //defined in i18n.js
  console.log(`language switch to: ${user_selected_lang}`)
  localStorage.setItem('alsoweather_app_lang', user_selected_lang)
  i18n_change(user_selected_lang)
  i18n_refresh()
  refresh_all()
}

function click_read_button_service() {
  if (window.speechSynthesis.speaking) {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      console.log('resume')
    } else {
      window.speechSynthesis.pause()
      console.log('paused')
    }
  } else {
    read_now_weather()
    console.log('read now')
  }
}

// restore location
function restore_location() {
  let data = localStorage.getItem('alsoweather_weather_location')
  if (data) {
    cwb_location_select_value = data
  } else {
    cwb_location_select_value = '嘉義縣'
  }
}

// restore speech
function restore_speech_voice() {
  let data = localStorage.getItem('alsoweather_app_speechVoice')
  if (data) {
    stored_speech_voice = data
  } else {
    stored_speech_voice = ''
  }
}
// restore location
function restore_app_lang() {
  let data = localStorage.getItem('alsoweather_app_lang')
  if (data) {
    user_selected_lang = data
    lang_select.value = data
  } else {
    user_selected_lang = 'zh-TW'
    lang_select.value = 'zh-TW'
  }
}

// fresh and refresh
function fresh() {
  fetch_cwb(CWB_API)
  fetch_quote(QUOTE_API)
  fresh_location_text()
}
function refresh_all() {
  // set loading class
  all_content_switch_to_loading()
  fresh()
}
function fresh_location_text() {
  let element = document.querySelector("[data-fillin-text='cwb_location_select_value']")
  element.innerText = cwb_location_select_value
}

// switch loading
function all_content_switch_to_loading() {
  cwb_location_select.parentElement.classList.add('is-loading')
  weather_block_inner_content.innerHTML = generate_skeleton_html(7)
  quote_block_inner_content.innerHTML = generate_skeleton_html(5)
  html_changed()
}

// speech
function speech_synthesis_init() {
  const speech = window.speechSynthesis
  if (speech.onvoiceschanged !== undefined) {
    speech.onvoiceschanged = () => populateVoiceList()
  }
}

function populateVoiceList() {
  speechSynthesis_config_container.innerHTML = ''
  let synth = window.speechSynthesis
  voices = synth.getVoices()
  if (!voices) return

  let div = document.createElement('select')
  let default_option = document.createElement('option')
  default_option.setAttribute('data-i18n-key', 'choose-voice')
  default_option.setAttribute('disabled', true)
  if (!stored_speech_voice) {
    default_option.setAttribute('selected', true)
  }
  div.appendChild(default_option)
  available_and_accept_speech_voice = []

  for (let i = 0; i < voices.length; i++) {
    let option = document.createElement('option')
    if (accept_speech_lang.includes(voices[i].lang)) {
      available_and_accept_speech_voice.push(voices[i])
    }
  }

  if (!available_and_accept_speech_voice) return

  for (let i = 0; i < available_and_accept_speech_voice.length; i++) {
    let option = document.createElement('option')
    let voices = available_and_accept_speech_voice
    option.textContent = voices[i].name + ' - ' + voices[i].lang

    option.value = voices[i].name
    option.setAttribute('data-lang', voices[i].lang)
    option.setAttribute('data-name', voices[i].name)
    if (stored_speech_voice) {
      if (voices[i].name === stored_speech_voice) {
        option.setAttribute('selected', true)
      }
    }
    console.log('append')
    div.appendChild(option)
  }

  // fill in read button
  speechSynthesis_container.innerHTML = generate_read_button_html()

  speechSynthesis_config_container.innerHTML += `
<div class="control has-icons-left mt-3 mb-3">
  <div class="select is-large is-fullwidth">
    <select id="populated_voice_select">
      ${div.innerHTML}
    </select>
  </div>
  <div class="icon is-large is-left">
    <i class="fas fa-volume-up"></i>
  </div>
</div>
  `
  html_changed()
  populated_voice_select = document.getElementById('populated_voice_select')
  populated_voice_select.addEventListener('input', () => {
    localStorage.setItem('alsoweather_app_speechVoice', populated_voice_select.value)
    stored_speech_voice = populated_voice_select.value
  })
}
// use now weather state object to generate html code
function generate_now_weather_speech_script(nowstate) {
  speech_script[
    'zh-TW'
  ] = `今日${cwb_location_select_value}天氣${nowstate.CI}、${nowstate.Wx}，最高溫度維${nowstate.MaxT}度C，最低溫度維${nowstate.MinT}度C，降雨機率${nowstate.PoP}趴。`
  speech_script[
    'en-US'
  ] = `Today's High Temperature is ${nowstate.MaxT} Celsius, Low Temperature is${nowstate.MinT}Celsius, probability of precipitation is ${nowstate.PoP} percent`
}

function read_now_weather() {
  if (!stored_speech_voice) {
    alert_modal(i18n_get('select-voice-in-config-section-first'), default_prompt_last_time)
    return
  }
  if (!populated_voice_select || !speech_script) return
  msg = speech_script
  voices = available_and_accept_speech_voice
  let speech = new SpeechSynthesisUtterance()
  let lang = ''
  for (let i = 0; i < voices.length; i++) {
    if (voices[i].name == stored_speech_voice) {
      speech.voice = voices[i]
      if (voices[i].name.includes('Chinese')) {
        lang = 'zh-TW'
      } else {
        lang = 'en-US'
      }
    }
  }
  speech.lang = lang
  speech.text = msg[lang]
  speech.volume = 1
  speech.rate = 1.1
  speech.pitch = 1
  stop_speech_if_speaking()
  window.speechSynthesis.speak(speech)
}

function stop_speech_if_speaking() {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel()
  }
}

// generate

// instant modal
function alert_modal(html, countdown) {
  if (!html) return
  prompt_modal_container.innerHTML = html
  // 創一個按鈕來關掉彈跳視窗
  let open_button = document.createElement('button')
  open_button.setAttribute('data-modal-to-open', 'prompt')
  open_modal(open_button)
  // 創一個按鈕來關掉彈跳視窗
  let close_button = document.createElement('button')
  close_button.setAttribute('data-modal-to-close', 'prompt')
  if (countdown && typeof countdown == 'number') {
    setTimeout(() => {
      close_modal(close_button)
    }, countdown)
  }
}

// generate location option
function generate_location_option(data_element) {
  let html = ''
  data_element.forEach((location) => {
    if (cwb_location_select_value != '' && location.locationName == cwb_location_select_value) {
      html += `<option selected value="${location.locationName}" id="location-${location.locationName}">${location.locationName}</option>`
    } else {
      html += `<option value="${location.locationName}" id="location-${location.locationName}">${location.locationName}</option>`
    }
  })
  return html
}

// use now weather state object to generate html code
function generate_now_weather(nowstate) {
  // let wxci = handleWeatherWxCIImage(nowstate.Wx, nowstate.CI)
  let wxci = {
    wx: {
      img: '',
    },
    ci: {
      img: '',
    },
  }
  let div = document.createElement('div')
  let wximgHtml = ``
  let ciimgHtml = ``
  if (wxci && wxci.wx.img) {
    wximgHtml = `
<img src="${wxci.wx.img}" alt="${nowstate.Wx}" style="max-width:100px" /><br>
<span style="font-weight:lighter;width:100%;" class="is-size-7">
  ${wxci.wx.attribution}
</span>
    `
  }
  if (wxci && wxci.ci.img) {
    ciimgHtml = `
<img src="${wxci.ci.img}" alt="${nowstate.CI}" style="max-width:100px" /><br>
<span style="font-weight:lighter;width:100%;" class="is-size-7">
  ${wxci.ci.attribution}
</span>
    `
  }
  let additional_pop_class = ''
  let additional_maxt_class = ''
  let additional_mint_class = ''
  if (nowstate.PoP >= 70) additional_pop_class += ' has-text-danger'
  if (nowstate.MaxT >= 28) additional_maxt_class += ' has-text-danger'
  if (nowstate.MinT <= 15) additional_mint_class += ' has-text-info'
  div.innerHTML += `
  <nav class="level">
    <div class="level-item has-text-centered">
      <div>
        <p class="heading" data-i18n-key="PoP">${i18n_get('PoP')}</p>
        <p class="title${additional_pop_class}"><i class="fas fa-cloud-showers-heavy"></i> ${nowstate.PoP}%</p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading" data-i18n-key="MaxT">${i18n_get('MaxT')}</p>
        <p class="title${additional_maxt_class}"><i class="fas fa-chevron-up"></i> ${nowstate.MaxT}°C</p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading" data-i18n-key="MinT">${i18n_get('MinT')}</p>
        <p class="title${additional_mint_class}"><i class="fas fa-chevron-down"></i> ${nowstate.MinT}°C</p>
      </div>
    </div>
  </nav>
  <div class="tile is-ancestor">
    <div class="tile is-parent is-12" style="gap: 12px;">
      <div class="tile is-child box has-text-centered" style="margin-bottom:6px !important;">
        <p class="title">${nowstate.Wx}</p>
        ${wximgHtml}
      </div>
      <div class="tile is-child box has-text-centered" style="margin-bottom:6px !important;">
        <p class="title">${nowstate.CI}</p>
        ${ciimgHtml}
      </div>
    </div>
  </div>
  `
  html_changed()
  return div
}
function generate_read_button_html() {
  return `
  <div class="columns">
    <div class="column">
      <button class="button is-success is-outlined is-large is-fullwidth" onClick="click_read_button_service()">
        <span class="icon is-small">
          <i class="fas fa-book-reader"></i>
        </span>
        <span class="ml-3" data-i18n-key="read">Read</span>
      </button>
    </div>
  </div>
  `
}

function generate_skeleton_html(line) {
  let html = ''
  for (let i = 0; i < line; i++) {
    html += `<div class="skeleton skeleton-text"></div>`
  }
  return html
}

// fill in

// fillin quote
function fillin_quote(data_element) {
  quote_block_inner_content.innerHTML = `<span class="is-large">${data_element.content}</span>`
  quote_block_inner_content.innerHTML += `<br><span class="has-text-grey">- ${data_element.author}</span>`
  html_changed()
}

// fillin_weather
function fillin_weather(element) {
  weather_block_inner_content.innerHTML = ''
  weather_block_inner_content.appendChild(element)
  cwb_location_select.parentElement.classList.remove('is-loading')
}

// fillin_location_select_options
function fillin_location_select_options(html) {
  cwb_location_select.innerHTML = `<option value="" data-i18n-key="choose-location" disabled selected>choose location</option>`
  cwb_location_select.innerHTML += html
  html_changed()
}

// modal control
function open_modal(buttonElement) {
  let modal_to_toggle = buttonElement.getAttribute('data-modal-to-open')
  let modal = document.querySelector(`[data-modal-name='${modal_to_toggle}']`)
  modal.classList.add('is-active')
  html.classList.add('is-clipped')
}

function close_modal(buttonElement) {
  let modal_to_toggle = buttonElement.getAttribute('data-modal-to-close')
  let modal = document.querySelector(`[data-modal-name='${modal_to_toggle}']`)
  modal.classList.remove('is-active')
  html.classList.remove('is-clipped')
}

// pwa
function reinstall_pwa() {
  let isconfirm = confirm('reinstall service worker?')
  if (isconfirm) {
    caches.delete('static')
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister()
        }
      })
    }
    alert_modal('Please reload the page', 3000)
  }
}

// dark mode
function darkmode_init() {
  const options = {
    mixColor: '#fff', // default: '#fff'
    backgroundColor: '#fff', // default: '#fff'
    buttonColorDark: '#100f2c', // default: '#100f2c'
    buttonColorLight: '#fff', // default: '#fff'
    saveInCookies: true, // default: true,
    label: '🌓', // default: ''
    autoMatchOsTheme: true, // default: true
  }
  darkmode = new Darkmode(options)
}

function toggle_darkmode() {
  darkmode.toggle()
}

function handleWeatherWxCIImage(Wx, CI) {
  let ciImg = ''
  let ciAttribution = ''
  let wxImg = ''
  let wxAttribution = ''
  if (CI == '舒適') {
    ciImg = './icon/ci/thermometer.png'
    ciAttribution = `<a href="https://www.flaticon.com/free-icons/thermal" title="Thermal icons">Thermal icons created by Flat Icons - Flaticon</a>`
  }
  if (Wx == '陰短暫雨') {
    wxImg = './icon/ci/cloudy.png'
    wxAttribution = `<a href="https://www.flaticon.com/free-icons/rain" title="rain icons">Rain icons created by iconixar - Flaticon</a>`
  }
  return {
    wx: {
      img: wxImg,
      attribution: wxAttribution,
    },
    ci: {
      img: ciImg,
      attribution: ciAttribution,
    },
  }
}

function openRadarModal() {
  let modal = document.getElementById('radar_iframe_modal')
  let iframe = document.getElementById('radar_iframe')
  let url = 'https://www.cwa.gov.tw/V8/C/W/OBS_Radar.html'
  iframe.src = url
  modal.classList.add('is-active')
}

function goToWeekForecast() {
  console.log(`./week?q=${cwb_location_select_value}`)
  window.location.assign(`./week/index.html?q=${cwb_location_select_value}`)
}

function whatToWearNow(high, low, pop) {
  // https://github.com/helenzhou6/Weather-to-wear/
  const genClothingMsg = (lowestTemp, highestTemp) => {
    if (lowestTemp < 5 && highestTemp < 10) {
      return '套頭毛衣'
    } else if (lowestTemp > 20 && highestTemp > 20) {
      return '短褲'
    } else if (lowestTemp < 20 && highestTemp > 20) {
      return '短褲和套頭毛衣'
    } else {
      return '不會太薄也不會太厚的衣服'
    }
  }
  const genCoatMsg = (precipProbability, precipType) => {
    if (precipProbability < 20) {
      return `不用帶${precipType}衣！`
    } else if (precipProbability > 70) {
      return `帶著${precipType}衣出門吧！`
    } else {
      return `最好帶著${precipType}衣`
    }
  }
  return `可以穿<b>${genClothingMsg(low, high)}</b>並且<b>${genCoatMsg(pop, '雨')}</b>`
}
