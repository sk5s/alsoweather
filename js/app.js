// declare keys

// api key
const CWB_KEY = 'CWB-1485B01A-7416-4E72-8ABB-E351980FD554'
// api url
const CWB_API = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${CWB_KEY}&format=JSON`
// api url
const QUOTE_API = `https://api.quotable.io/random`

cwb_location_select_value = ''

// grab html dom element
let cwb_location_select = document.getElementById('cwb_location_select')
let quote_block_inner_content = document.getElementById('quote_block_inner_content')
let weather_block_inner_content = document.getElementById('weather_block_inner_content')
let speechSynthesis_container = document.getElementById('speechSynthesis_container')

// event
cwb_location_select.addEventListener('input', location_input_service)

// init
document.addEventListener('DOMContentLoaded', () => {
  restore_location()
  fresh()
  // speech_synthesis_init()
})

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
        fillin_weather(generate_now_weather(parsed_cwb_data.now))
      })
  } catch (error) {
    alert(error.message)
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

// fresh and refresh
function fresh() {
  fetch_cwb(CWB_API)
  fetch_quote(QUOTE_API)
}
function refresh_all() {
  // set loading class
  all_content_switch_to_loading()
  fresh()
}

// switch loading
function all_content_switch_to_loading() {
  cwb_location_select.parentElement.classList.add('is-loading')
  weather_block_inner_content.innerHTML = `
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text"></div>
  `
  quote_block_inner_content.innerHTML = `
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text"></div>
  `
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
        <p class="heading">降雨機率</p>
        <p class="title"><i class="fas fa-cloud-showers-heavy"></i> ${nowstate.PoP}%</p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">最低溫度</p>
        <p class="title"><i class="fas fa-chevron-down"></i> ${nowstate.MinT}°C</p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">最高溫度</p>
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
  return div
}

// fill in

// fillin quote
function fillin_quote(data_element) {
  quote_block_inner_content.innerHTML = `<span class="is-large">${data_element.content}</span>`
  quote_block_inner_content.innerHTML += `<br><span class="has-text-grey">- ${data_element.author}</span>`
}

// fillin_weather
function fillin_weather(element) {
  weather_block_inner_content.innerHTML = ''
  weather_block_inner_content.appendChild(element)
  cwb_location_select.parentElement.classList.remove('is-loading')
}

// fillin_location_select_options
function fillin_location_select_options(html) {
  cwb_location_select.innerHTML = "<option value='' disabled selected>選擇地區</option>"
  cwb_location_select.innerHTML += html
}
