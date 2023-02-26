let cwb_location_select_value = ''

// init
document.addEventListener('DOMContentLoaded', () => {
  let locationName = getUrlLocationName()
  if (locationName != null) {
    restoreAppLang()
    i18n_init()
    darkmodeInit()
    getDataService()
    restoreLocation()
    document.getElementById('cwb_location_select').addEventListener('input', locationInputService)
  } else {
    console.log("Don't have location so redirect")
    window.location.assign('../')
  }
})

function getUrlLocationName() {
  const urlParams = new URLSearchParams(window.location.search)
  const locationName = urlParams.get('q')
  console.log(locationName)
  return locationName
}

// dark mode
function darkmodeInit() {
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

// restore app lang
function restoreAppLang() {
  let data = localStorage.getItem('alsoweather_app_lang')
  if (data) {
    user_selected_lang = data
  } else {
    user_selected_lang = 'zh-TW'
  }
}

// get data
function getDataService() {
  let cityUrl = ''
  switch (getUrlLocationName()) {
    case '宜蘭縣':
      cityUrl = 'F-D0047-003'
      break
    case '桃園市':
      cityUrl = 'F-D0047-007'
      break
    case '新竹縣':
      cityUrl = 'F-D0047-011'
      break
    case '苗栗縣':
      cityUrl = 'F-D0047-015'
      break
    case '彰化縣':
      cityUrl = 'F-D0047-019'
      break
    case '南投縣':
      cityUrl = 'F-D0047-023'
      break
    case '雲林縣':
      cityUrl = 'F-D0047-027'
      break
    case '嘉義縣':
      cityUrl = 'F-D0047-031'
      break
    case '屏東縣':
      cityUrl = 'F-D0047-035'
      break
    case '花蓮縣':
      cityUrl = 'F-D0047-043'
      break
    case '澎湖縣':
      cityUrl = 'F-D0047-047'
      break
    case '基隆市':
      cityUrl = 'F-D0047-051'
      break
    case '新竹市':
      cityUrl = 'F-D0047-055'
      break
    case '嘉義市':
      cityUrl = 'F-D0047-059'
      break
    case '臺北市':
      cityUrl = 'F-D0047-063'
      break
    case '高雄市':
      cityUrl = 'F-D0047-067'
      break
    case '新北市':
      cityUrl = 'F-D0047-071'
      break
    case '臺中市':
      cityUrl = 'F-D0047-075'
      break
    case '臺南市':
      cityUrl = 'F-D0047-079'
      break
    case '連江縣':
      cityUrl = 'F-D0047-083'
      break
    case '金門縣':
      cityUrl = 'F-D0047-087'
      break
    default:
      cityUrl = 'F-D0047-031'
      break
  }
  fetch_cwb(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/${cityUrl}?Authorization=${CWB_KEY}&format=JSON`)
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
        const findLocationIndex = (element, locationNametosearch) => {
          let locationNameIndex = -1 //-1表示未找到
          for (let i = 0; i < element.length; i++) {
            let locationName = element[i].locationName
            if (locationNametosearch == locationName) {
              locationNameIndex = i
            }
          }
          return locationNameIndex
        }
        let cwbData = data.records.locations[0].location
        let options = generateLocationOption(cwbData)
        fillinLocationSelectOptions(options)
        console.log(cwbData)
        let locationIndex = findLocationIndex(cwbData, cwb_location_select_value)
        console.log(locationIndex)
        if (locationIndex == -1) {
          console.log('location error! Please choose new one')
          return
        }
        console.log(cwbData[locationIndex].weatherElement)
        cwbData[locationIndex].weatherElement[0].time
        let mainSwiperWrapper = document.getElementById('main-swiper-wrapper')
        mainSwiperWrapper.innerHTML = ``
        for (let i = 0; i < 14; i++) {
          let div = generateWeatherDiv({
            time: {
              start: cwbData[locationIndex].weatherElement[0].time[i].startTime,
              end: cwbData[locationIndex].weatherElement[0].time[i].endTime,
            },
            PoP: cwbData[locationIndex].weatherElement[0].time[i].elementValue[0].value,
            MaxT: cwbData[locationIndex].weatherElement[12].time[i].elementValue[0].value,
            MinT: cwbData[locationIndex].weatherElement[8].time[i].elementValue[0].value,
            Wx: cwbData[locationIndex].weatherElement[6].time[i].elementValue[0].value,
            CI: cwbData[locationIndex].weatherElement[7].time[i].elementValue[1].value,
          })
          mainSwiperWrapper.innerHTML += `
          <div class="swiper-slide" id="slide-${i}" style="min-height: 290px;">
            <div style="margin:45px;height:100%;vertical-align: middle;">
            ${div.innerHTML}
            </div>
          </div>
          `
        }
        const swiper = new Swiper('.swiper', {
          // Optional parameters
          direction: 'horizontal',
          loop: true,
          spaceBetween: 100,
          slidesPerView: 1,

          // If we need pagination
          pagination: {
            el: '.swiper-pagination',
          },

          // Navigation arrows
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
        })
      })
  } catch (error) {
    console.log(error)
  }
}

// fillin_location_select_options
function fillinLocationSelectOptions(html) {
  let cwb_location_select = document.getElementById('cwb_location_select')
  cwb_location_select.innerHTML = `<option value="" data-i18n-key="choose-location" disabled selected>choose location</option>`
  cwb_location_select.innerHTML += html
  i18n_refresh()
}
function generateLocationOption(data) {
  let html = ''
  data.forEach((location) => {
    if (cwb_location_select_value != '' && location.locationName == cwb_location_select_value) {
      html += `<option selected value="${location.locationName}" id="location-${location.locationName}">${location.locationName}</option>`
    } else {
      html += `<option value="${location.locationName}" id="location-${location.locationName}">${location.locationName}</option>`
    }
  })
  return html
}
// input service
function locationInputService() {
  let cwb_location_select = document.getElementById('cwb_location_select')
  cwb_location_select_value = cwb_location_select.value
  console.log(cwb_location_select_value)
  localStorage.setItem('alsoweather_weather_city', cwb_location_select_value)
  getDataService()
}
function restoreLocation() {
  let data = localStorage.getItem('alsoweather_weather_city')
  if (data) {
    cwb_location_select_value = data
  }
}

function generateWeatherDiv(nowstate) {
  let div = document.createElement('div')
  let timeName = ''
  if (nowstate.time.start.split(' ')[1] == '18:00:00') {
    timeName = '晚上'
  } else if (nowstate.time.start.split(' ')[1] == '12:00:00') {
    timeName = '中午'
  } else {
    timeName = '早上'
  }
  let time = nowstate.time.start.split(' ')[0].split('-').join('/') + ' ' + timeName
  let additional_pop_class = ''
  let additional_maxt_class = ''
  let additional_mint_class = ''
  if (nowstate.PoP >= 70) additional_pop_class += ' has-text-danger'
  if (nowstate.MaxT >= 28) additional_maxt_class += ' has-text-danger'
  if (nowstate.MinT <= 15) additional_mint_class += ' has-text-info'
  let PoPHtml = ``
  if (nowstate.PoP != ' ') {
    PoPHtml = `
  <div class="level-item has-text-centered">
    <div>
      <p class="heading" data-i18n-key="PoP">${i18n_get('PoP')}</p>
      <p class="title${additional_pop_class}"><i class="fas fa-cloud-showers-heavy"></i> ${nowstate.PoP}%</p>
    </div>
  </div>`
  }
  div.innerHTML += `
  <h1 class="title is-5">${time}</h1>
  <nav class="level">
    ${PoPHtml}
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
    <div class="tile is-parent is-11" style="gap: 12px;">
      <div class="tile is-child box has-text-centered" style="margin-bottom:6px !important;">
        <p class="title">${nowstate.Wx}</p>
      </div>
      <div class="tile is-child box has-text-centered" style="margin-bottom:6px !important;">
        <p class="title">${nowstate.CI}</p>
      </div>
    </div>
  </div>
  `
  return div
}
