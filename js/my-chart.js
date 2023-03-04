let weather_chart_element
let delayed

const CHART_COLORS = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)',
}
const line_chart_border_width = 3

if (localStorage.getItem('darkmode') == 'true') {
  console.log('generate chart in dark mode')
  Chart.defaults.color = '#fff'
  Chart.defaults.borderColor = '#6f6f6f'
} else {
  console.log('generate chart in light mode')
}

function generate_weather_chart_data(weatherElement) {
  // localStorage.getItem("")
  const time = (str) => {
    let m = new Date(str)
    let dateString = `${m.getUTCMonth() + 1}/${m.getUTCDate()} ${m.getUTCHours()}${i18n_get('o_clock')}`
    return dateString
  }

  let maxt_chart_image_data = {
    datasets: [],
  }

  let mint_chart_image_data = {
    datasets: [],
  }

  let labels = []

  // 產生標籤
  let data = []
  for (let z = 0; z < weatherElement[0].time.length; z++) {
    const element = weatherElement[0].time[z]

    data.push(time(element.startTime))
    // 如果是最後一個Time
    if (z == weatherElement[0].time.length - 1) {
      data.push(time(element.endTime))
    }
  }
  for (let y = 0; y < data.length - 1; y++) {
    labels.push([`${data[y]} ${i18n_get('to')}`, data[y + 1]])
  }

  for (let i = 0; i < weatherElement.length; i++) {
    let weatherElementName = weatherElement[i].elementName

    // 如果是最大溫度
    if (weatherElementName == 'MaxT') {
      maxt_chart_image_data.datasets = [
        {
          label: i18n_get('MaxT'),
          data: [],
          pointStyle: 'rectRounded',
          pointRadius: 8,
          pointHoverRadius: 12,
          borderColor: CHART_COLORS.red,
          backgroundColor: CHART_COLORS.red,
          borderWidth: line_chart_border_width,
        },
      ]
      for (let n = 0; n < weatherElement[i].time.length; n++) {
        const element = weatherElement[i].time[n]
        maxt_chart_image_data.datasets[0].data.push(element.parameter.parameterName)
      }
      // console.log(JSON.stringify(maxt_chart_image_data))
    }
    // 如果是最小溫度
    if (weatherElementName == 'MinT') {
      mint_chart_image_data.datasets = [
        {
          label: i18n_get('MinT'),
          data: [],
          pointStyle: 'rectRounded',
          pointRadius: 8,
          pointHoverRadius: 12,
          borderColor: CHART_COLORS.blue,
          backgroundColor: CHART_COLORS.blue,
          borderWidth: line_chart_border_width,
        },
      ]
      for (let n = 0; n < weatherElement[i].time.length; n++) {
        const element = weatherElement[i].time[n]
        mint_chart_image_data.datasets[0].data.push(element.parameter.parameterName)
      }
      // console.log(JSON.stringify(mint_chart_image_data))
    }
  }
  if (weather_chart_element != undefined) weather_chart_element.destroy()
  weather_chart_canvas = document.getElementById('weather_chart_canvas')
  let config = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [maxt_chart_image_data.datasets[0], mint_chart_image_data.datasets[0]],
    },
    options: {
      responsive: true,
      animation: {
        onComplete: () => {
          delayed = true
        },
        delay: (context) => {
          let delay = 0
          if (context.type === 'data' && context.mode === 'default' && !delayed) {
            delay = context.dataIndex * 300 + context.datasetIndex * 100
          }
          return delay
        },
      },
      plugins: {
        title: {
          display: true,
          text: '36小時天氣預測最高最低溫',
        },
      },
    },
  }
  // console.dir(config)
  weather_chart_element = chart(weather_chart_canvas, config)
}

function chart(element, params) {
  let canvas = new Chart(element, params)
  if (canvas == null) console.error('canvas null')
  return canvas
}

function generateWeekWeatherChart(weatherElement) {
  console.log(weatherElement)
  const time = (str) => {
    let m = new Date(str)
    let dateString = `${m.getUTCMonth() + 1}/${m.getUTCDate()} ${m.getUTCHours()}${i18n_get('o_clock')}`
    return dateString
  }

  let maxt_chart_image_data = {
    datasets: [],
  }

  let mint_chart_image_data = {
    datasets: [],
  }

  let labels = []

  // 產生標籤
  let data = []
  for (let z = 0; z < weatherElement[0].time.length; z++) {
    const element = weatherElement[0].time[z]

    data.push(time(element.startTime))
    // 如果是最後一個Time
    if (z == weatherElement[0].time.length - 1) {
      data.push(time(element.endTime))
    }
  }
  for (let y = 0; y < data.length - 1; y++) {
    labels.push([`${data[y]} ${i18n_get('to')}`, data[y + 1]])
  }

  for (let i = 0; i < weatherElement.length; i++) {
    let weatherElementName = weatherElement[i].elementName

    // 如果是最大溫度
    if (weatherElementName == 'MaxT') {
      maxt_chart_image_data.datasets = [
        {
          label: i18n_get('MaxT'),
          data: [],
          pointStyle: 'rectRounded',
          pointRadius: 8,
          pointHoverRadius: 12,
          borderColor: CHART_COLORS.red,
          backgroundColor: CHART_COLORS.red,
          borderWidth: line_chart_border_width,
        },
      ]
      for (let n = 0; n < weatherElement[i].time.length; n++) {
        const element = weatherElement[i].time[n]
        maxt_chart_image_data.datasets[0].data.push(element.elementValue[0].value)
      }
    }
    // 如果是最小溫度
    if (weatherElementName == 'MinT') {
      mint_chart_image_data.datasets = [
        {
          label: i18n_get('MinT'),
          data: [],
          pointStyle: 'rectRounded',
          pointRadius: 8,
          pointHoverRadius: 12,
          borderColor: CHART_COLORS.blue,
          backgroundColor: CHART_COLORS.blue,
          borderWidth: line_chart_border_width,
        },
      ]
      for (let n = 0; n < weatherElement[i].time.length; n++) {
        const element = weatherElement[i].time[n]
        mint_chart_image_data.datasets[0].data.push(element.elementValue[0].value)
      }
    }
  }
  if (weather_chart_element != undefined) weather_chart_element.destroy()
  weather_chart_canvas = document.getElementById('weather_chart_canvas')
  console.log(weather_chart_canvas)
  let config = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [maxt_chart_image_data.datasets[0], mint_chart_image_data.datasets[0]],
    },
    options: {
      responsive: true,
      animation: {
        onComplete: () => {
          delayed = true
        },
        delay: (context) => {
          let delay = 0
          if (context.type === 'data' && context.mode === 'default' && !delayed) {
            delay = context.dataIndex * 70 + context.datasetIndex * 100
          }
          return delay
        },
      },
      plugins: {
        title: {
          display: true,
          text: '一周天氣最高最低溫預測',
        },
      },
    },
  }
  weather_chart_element = chart(weather_chart_canvas, config)
}
