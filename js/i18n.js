let user_selected_lang

let i18n_resources = {
  en: {
    translation: {
      test: 'hello world',
      config: 'Config',
      'choose-location': 'Choose location',
      close: 'Close',
      quote: 'Quote',
      read: 'Read',
      PoP: 'PoP',
      MinT: 'MinT',
      MaxT: 'MaxT',
      refresh: 'Refresh',
      o_clock: " o'clock",
      to: 'to',
    },
  },
  zh: {
    translation: {
      test: '哈囉！',
      config: '設定',
      'choose-location': '選擇地區',
      close: '關閉',
      quote: '佳句',
      read: '閱讀',
      PoP: '降雨機率',
      MinT: '最低溫度',
      MaxT: '最高溫度',
      refresh: '重新整理',
      o_clock: '點',
      to: '到',
    },
  },
}

// !!! key 不能和內容一樣
function i18n_init() {
  i18next
    .init({
      lng: getLanguage(),
      debug: true,
      resources: i18n_resources,
    })
    .then((t) => {
      fillin_text_by_data_attribute()
    })
}

function i18n_refresh() {
  fillin_text_by_data_attribute()
}

function i18n_get(key) {
  return i18next.t(key)
}

function getLanguage() {
  let browser = navigator.language
  if (!user_selected_lang) {
    if (browser.includes('zh') || browser.includes('en')) {
      return browser
    } else {
      return 'en'
    }
  } else {
    return user_selected_lang
  }
}

function fillin_text_by_data_attribute() {
  let elements = document.querySelectorAll('[data-i18n-key]')
  elements.forEach((el) => {
    let key = el.getAttribute('data-i18n-key')
    el.innerText = i18next.t(key)
  })
}
