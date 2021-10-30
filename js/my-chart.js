let weather_chart_element

const CHART_COLORS = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)',
}

function generate_weather_chart_data(weatherElement) {
  const time = (str) => {
    let m = new Date(str)
    let dateString = `${m.getUTCMonth() + 1}/${m.getUTCDate()} ${m.getUTCHours()}點`
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
    labels.push([`${data[y]} -`, data[y + 1]])
  }

  for (let i = 0; i < weatherElement.length; i++) {
    let weatherElementName = weatherElement[i].elementName

    // 如果是最大溫度
    if (weatherElementName == 'MaxT') {
      maxt_chart_image_data.datasets = [
        {
          label: '最大溫度',
          data: [],
          borderColor: CHART_COLORS.red,
        },
      ]
      for (let n = 0; n < weatherElement[i].time.length; n++) {
        const element = weatherElement[i].time[n]
        maxt_chart_image_data.datasets[0].data.push(element.parameter.parameterName)
      }
      console.log(JSON.stringify(maxt_chart_image_data))
    }
    // 如果是最小溫度
    if (weatherElementName == 'MinT') {
      mint_chart_image_data.datasets = [
        {
          label: '最小溫度',
          data: [],
          borderColor: CHART_COLORS.blue,
        },
      ]
      for (let n = 0; n < weatherElement[i].time.length; n++) {
        const element = weatherElement[i].time[n]
        mint_chart_image_data.datasets[0].data.push(element.parameter.parameterName)
      }
      console.log(JSON.stringify(mint_chart_image_data))
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
      plugins: {
        title: {
          display: true,
          text: '36h天氣預測',
        },
      },
    },
  }
  console.dir(config)
  weather_chart_element = chart(weather_chart_canvas, config)
}

function chart(element, params) {
  let canvas = new Chart(element, params)
  if (canvas == null) console.error('canvas null')
  return canvas
}
