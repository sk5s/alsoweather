// declare keys

// api key
const CWB_KEY = 'CWB-1485B01A-7416-4E72-8ABB-E351980FD554'
// api url
const CWB_API = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${CWB_KEY}&format=JSON`
// api url
const QUOTE_API = `https://api.quotable.io/random`

// accept speech lang (lower case)
let accept_speech_lang = ['zh-TW', 'en-US']

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

// grab html dom element
let html = document.getElementById('html')
let cwb_location_select = document.getElementById('cwb_location_select')
let quote_block_inner_content = document.getElementById('quote_block_inner_content')
let weather_block_inner_content = document.getElementById('weather_block_inner_content')
let weather_chart_inner_content = document.getElementById('weather_chart_inner_content')
let speechSynthesis_container = document.getElementById('speechSynthesis_container')
let speechSynthesis_config_container = document.getElementById('speechSynthesis_config_container')

let weather_chart_canvas = document.getElementById('weather_chart_canvas')

// event
cwb_location_select.addEventListener('input', location_input_service)

// init
document.addEventListener('DOMContentLoaded', () => {
  restore_location()
  restore_speech_voice()
  fresh()
  speech_synthesis_init()
  i18n_init()
})

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
          alert('location error! Please choose new one')
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
      })
  } catch (error) {
    console.log(error)
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
    alert(error.message)
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

// location input service
function location_input_service() {
  cwb_location_select_value = cwb_location_select.value
  refresh_all()
  console.log(cwb_location_select_value)
  localStorage.setItem('locationSelected', cwb_location_select_value)
}

// restore location
function restore_location() {
  let data = localStorage.getItem('locationSelected')
  if (data) {
    cwb_location_select_value = data
  } else {
    cwb_location_select_value = '臺北市'
  }
}

// restore location
function restore_speech_voice() {
  let data = localStorage.getItem('speechVoice')
  if (data) {
    stored_speech_voice = data
  } else {
    stored_speech_voice = ''
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
      if (voices[i].name == stored_speech_voice) {
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
    localStorage.setItem('speechVoice', populated_voice_select.value)
    stored_speech_voice = populated_voice_select.value
  })
}
// use now weather state object to generate html code
function generate_now_weather_speech_script(nowstate) {
  speech_script[
    'zh-TW'
  ] = `今天天氣${nowstate.CI}、${nowstate.Wx}，最高溫度維${nowstate.MaxT}度C，最低溫度維${nowstate.MinT}度C，降雨機率${nowstate.PoP}趴。`
  speech_script[
    'en-US'
  ] = `Today's High Temperature is ${nowstate.MaxT} Celsius, Low Temperature is${nowstate.MinT}Celsius, probability of precipitation is ${nowstate.PoP} percent`
}

function read_now_weather() {
  if (!populated_voice_select || !speech_script || !stored_speech_voice) return
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
  let div = document.createElement('div')
  div.innerHTML += `
  <nav class="level">
    <div class="level-item has-text-centered">
      <div>
        <p class="heading" data-i18n-key="PoP">降雨機率</p>
        <p class="title"><i class="fas fa-cloud-showers-heavy"></i> ${nowstate.PoP}%</p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading" data-i18n-key="MinT">最低溫度</p>
        <p class="title"><i class="fas fa-chevron-down"></i> ${nowstate.MinT}°C</p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading" data-i18n-key="MaxT">最高溫度</p>
        <p class="title"><i class="fas fa-chevron-up"></i> ${nowstate.MaxT}°C</p>
      </div>
    </div>
  </nav>
  <div class="tile is-ancestor">
    <div class="tile is-12 is-parent">
      <div class="tile is-child box">
        <p class="title">${nowstate.Wx}</p>
      </div>
      <div class="tile is-child box">
        <p class="title">${nowstate.CI}</p>
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
      <button class="button is-success is-outlined is-large is-fullwidth" onClick="read_now_weather()">
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

// config modal
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
