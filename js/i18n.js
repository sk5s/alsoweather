let user_selected_lang = 'en'

let i18n_resources = {
  en: {
    translation: {
      test: 'hello!',
      config: 'Config',
      'choose-location': 'Choose location',
      'choose-voice': 'Choose voice',
      close: 'Close',
      quote: 'Quote',
      read: 'Read',
      PoP: 'PoP',
      MinT: 'MinT',
      MaxT: 'MaxT',
      refresh: 'Refresh',
      o_clock: " o'clock",
      to: 'to',
      about: 'About',
      'how-install-pwa': 'How to install PWA',
      'reinstall-pwa': 'Reinstall PWA',
      'toggle-darkmode': 'Toggle darkmode',
      'select-voice-in-config-section-first': 'Select voice in config section first!',
    },
  },
  zh: {
    translation: {
      test: '哈囉！',
      config: '設定',
      'choose-location': '選擇地區',
      'choose-voice': '選擇聲音',
      close: '關閉',
      quote: '佳句',
      read: '讀出天氣',
      PoP: '降雨機率',
      MinT: '最低溫度',
      MaxT: '最高溫度',
      refresh: '重新整理',
      o_clock: '點',
      to: '到',
      about: '關於',
      'how-install-pwa': '如何安裝漸進式網頁應用程式',
      'reinstall-pwa': '重新安裝網頁應用程式',
      'toggle-darkmode': '切換黑暗模式',
      'select-voice-in-config-section-first': '請先在設定中選擇聲音！',
      'see-tour': '看導覽',
      radar: '雷達回波',
    },
  },
}
function i18n_init() {
  console.log(i18next)
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

function i18n_change(lng) {
  i18next.changeLanguage(lng)
}

function getLanguage() {
  let browser = navigator.language
  if (!user_selected_lang) {
    if (browser.includes('zh') || browser.includes('en')) {
      if (browser.includes('zh')) {
        return 'zh'
      } else {
        return 'en'
      }
    } else {
      return 'zh' //changed from en to zh
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
