import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.less'
import {
  add_lexeme,
  request_unhighlight,
  localizeHtmlPage,
} from '../common_lib'
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  useAuth,
  useUser,
  ClerkProvider,
  useClerk,
} from '@clerk/chrome-extension'

let dict_size = 0
let enabled_mode = true

function display_mode() {
  chrome.tabs.query(
    {
      active: true,
      lastFocusedWindow: true,
    },
    function (tabs) {
      const tab = tabs[0]
      const url = new URL(tab.url)
      const domain = url.hostname
      document.getElementById('addHostName').textContent = domain
      const addToListLabelElem = document.getElementById(
        'addToListLabel',
      ) as HTMLAnchorElement
      const addToListElem = document.getElementById(
        'addToList',
      ) as HTMLInputElement
      if (enabled_mode) {
        const rbEnabledElem = document.getElementById(
          'rb_enabled',
        ) as HTMLInputElement
        rbEnabledElem.checked = true
        addToListLabelElem.textContent =
          chrome.i18n.getMessage('addSkippedLabel')
        addToListLabelElem.href = chrome.runtime.getURL('black_list.html')
        chrome.storage.sync.get(['wd_black_list'], function (result) {
          const black_list = result.wd_black_list
          addToListElem.checked = black_list.hasOwnProperty(domain)
        })
      } else {
        const rbDisabledElem = document.getElementById(
          'rb_disabled',
        ) as HTMLInputElement
        rbDisabledElem.checked = true
        addToListLabelElem.textContent =
          chrome.i18n.getMessage('addFavoritesLabel')
        addToListLabelElem.href = chrome.runtime.getURL('white_list.html')
        chrome.storage.sync.get(['wd_white_list'], function (result) {
          const white_list = result.wd_white_list
          addToListElem.checked = white_list.hasOwnProperty(domain)
        })
      }
    },
  )
}

function process_checkbox() {
  const checkboxElem = document.getElementById('addToList') as HTMLInputElement
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    const tab = tabs[0]
    const url = new URL(tab.url)
    const domain = url.hostname
    document.getElementById('addHostName').textContent = domain
    const list_name = enabled_mode ? 'wd_black_list' : 'wd_white_list'
    chrome.storage.sync.get([list_name], function (result) {
      const site_list = result[list_name]
      if (checkboxElem.checked) {
        site_list[domain] = 1
      } else {
        delete site_list[domain]
      }
      chrome.storage.sync.set({ [list_name]: site_list }, function () {
        display_mode()
      })
    })
  })
}

function process_mode_switch() {
  const rbEnabledElem = document.getElementById(
    'rb_enabled',
  ) as HTMLInputElement
  const rbDisabledElem = document.getElementById(
    'rb_disabled',
  ) as HTMLInputElement
  if (rbEnabledElem.checked) {
    enabled_mode = true
  } else if (rbDisabledElem.checked) {
    enabled_mode = false
  }
  chrome.storage.sync.set({ wd_is_enabled: enabled_mode })
  display_mode()
}

function process_show() {
  chrome.tabs.create(
    { url: chrome.runtime.getURL('display.html') },
    function (tab) {
      // opens import dialong in new tab
    },
  )
}

function process_help() {
  console.log('11')
  chrome.tabs.create(
    { url: chrome.runtime.getURL('help.html') },
    function (tab) {
      // opens import dialong in new tab
    },
  )
}

function process_adjust() {
  chrome.tabs.create(
    { url: chrome.runtime.getURL('adjust.html') },
    function (tab) {
      // opens adjust dialong in new tab
    },
  )
}

function display_vocabulary_size() {
  chrome.storage.sync.get(['wd_user_vocabulary'], function (result) {
    const { wd_user_vocabulary } = result
    const vocab_size = Object.keys(wd_user_vocabulary).length
    document.getElementById('vocabIndicator').textContent = `${vocab_size}`
  })
}

function popup_handle_add_result(report: string, lemma: string) {
  if (report === 'ok') {
    request_unhighlight(lemma)
    display_vocabulary_size()
    const addTextElem = document.getElementById('addText') as HTMLInputElement
    addTextElem.value = ''
    document.getElementById('addOpResult').textContent =
      chrome.i18n.getMessage('addSuccess')
  } else if (report === 'exists') {
    document.getElementById('addOpResult').textContent =
      chrome.i18n.getMessage('addErrorDupp')
  } else {
    document.getElementById('addOpResult').textContent =
      chrome.i18n.getMessage('addErrorBad')
  }
}

function process_add_word() {
  const addTextElem = document.getElementById('addText') as HTMLInputElement
  const lexeme = addTextElem.value
  if (lexeme === 'dev-mode-on') {
    chrome.storage.sync.set({ wd_developer_mode: true })
    addTextElem.value = ''
    return
  }
  if (lexeme === 'dev-mode-off') {
    chrome.storage.sync.set({ wd_developer_mode: false })
    addTextElem.value = ''
    return
  }
  add_lexeme(lexeme, popup_handle_add_result)
}
function display_percents(show_percents: number) {
  const not_showing_cnt = Math.floor((dict_size / 100.0) * show_percents)
  document.getElementById('rateIndicator1').textContent = `${show_percents}%`
  document.getElementById('rateIndicator2').textContent = `${show_percents}%`
  document.getElementById('countIndicator').textContent = `${not_showing_cnt}`
}
function process_rate(increase: number) {
  chrome.storage.sync.get(['wd_show_percents'], function (result) {
    let show_percents = result.wd_show_percents
    show_percents += increase
    show_percents = Math.min(100, Math.max(0, show_percents))
    display_percents(show_percents)
    chrome.storage.sync.set({ wd_show_percents: show_percents })
  })
}

function process_rate_m1() {
  process_rate(-1)
}
function process_rate_m10() {
  process_rate(-10)
}
function process_rate_p1() {
  process_rate(1)
}
function process_rate_p10() {
  process_rate(10)
}

function init_controls() {
  document
    .getElementById('addToList')
    .addEventListener('click', process_checkbox)
  document.getElementById('adjust').addEventListener('click', process_adjust)
  document.getElementById('showVocab').addEventListener('click', process_show)
  // document.getElementById('getHelp').addEventListener('click', process_help)
  document.getElementById('addWord').addEventListener('click', process_add_word)
  document.getElementById('rateM10').addEventListener('click', process_rate_m10)
  document.getElementById('rateM1').addEventListener('click', process_rate_m1)
  document.getElementById('rateP1').addEventListener('click', process_rate_p1)
  document.getElementById('rateP10').addEventListener('click', process_rate_p10)
  document
    .getElementById('rb_enabled')
    .addEventListener('click', process_mode_switch)
  document
    .getElementById('rb_disabled')
    .addEventListener('click', process_mode_switch)

  document
    .getElementById('addText')
    .addEventListener('keyup', function (event) {
      event.preventDefault()
      if (event.keyCode === 13) {
        process_add_word()
      }
    })

  display_vocabulary_size()

  chrome.storage.sync.get(
    ['wd_show_percents', 'wd_is_enabled', 'wd_word_max_rank'],
    function (result) {
      const show_percents = result.wd_show_percents
      enabled_mode = result.wd_is_enabled
      dict_size = result.wd_word_max_rank
      chrome.storage.local.get(['wd_word_max_rank'], function (result1) {
        dict_size = result1.wd_word_max_rank
        display_percents(show_percents)
        display_mode()
      })
    },
  )
}

function Popup() {
  const { getToken } = useAuth()
  useEffect(() => {
    // localizeHtmlPage()
    init_controls()
  }, [])
  const handleClick = async () => {
    const token = await getToken()
    fetch('http://localhost:3000/api/vocabulary', {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then(console.log)
  }
  return (
    <>
      <fieldset>
        <input
          type="radio"
          id="rb_enabled"
          name="switch_mode"
          value="rb_enabled"
        />
        <label className="cbLabel" htmlFor="rb_enabled">
          {chrome.i18n.getMessage('enabledDescription')}
        </label>
        <br />
        <input
          type="radio"
          id="rb_disabled"
          name="switch_mode"
          value="rb_disabled"
        />
        <label className="cbLabel" htmlFor="rb_disabled">
          {chrome.i18n.getMessage('disabledDescription')}
        </label>
        <br />
        <div id="add_to_list_group">
          <input type="checkbox" id="addToList" />
          <span className="cbLabel">
            <span>{chrome.i18n.getMessage('addVerb')} "</span>
            <span id="addHostName"></span>
            <span>" {chrome.i18n.getMessage('toVerb')}</span>
            <a href="example.com" target="_blank" id="addToListLabel"></a>
          </span>
        </div>
        <br />
      </fieldset>
      <br />
      <fieldset>
        <div className="rateInfo">
          {chrome.i18n.getMessage('rateInfo1')}
          <span className="indicator" id="countIndicator">
            n/a
          </span>{' '}
          (
          <span className="indicator" id="rateIndicator1">
            n/a
          </span>
          ) {chrome.i18n.getMessage('rateInfo2')}
        </div>
        <button className="rateButton" id="rateM10">
          -10
        </button>
        <button className="rateButton" id="rateM1">
          -1
        </button>
        <div className="display: inline-block" id="rateIndicator2">
          n/a
        </div>
        <button className="rateButton" id="rateP1">
          +1
        </button>
        <button className="rateButton" id="rateP10">
          +10
        </button>
      </fieldset>
      <br />
      <fieldset>
        <div className="rateInfo">
          {chrome.i18n.getMessage('vocabSizeInfo1')}
          <span className="indicator" id="vocabIndicator">
            n/a
          </span>
          {chrome.i18n.getMessage('vocabSizeInfo2')}
        </div>
        <button
          className="vocabButton margin_bottom display_block"
          id="showVocab"
        >
          {chrome.i18n.getMessage('showVocab')}
        </button>
        <span className="rateInfo">{chrome.i18n.getMessage('tipInfo')}</span>
        <br />
        <input type="text" id="addText" />
        <button className="addButton" id="addWord">
          <img src="./assets/add.png" />
        </button>
        <br />
        <span className="rateInfo" id="addOpResult"></span>
      </fieldset>
      <br />
      <fieldset>
        <button className="vocabButton" id="adjust">
          {chrome.i18n.getMessage('adjust')}
        </button>
        <button className="helpButton" id="getHelp" onClick={process_help}>
          ?
        </button>
      </fieldset>
    </>
  )
}

function PopupWrap() {
  const { isSignedIn, user } = useUser()
  console.log(isSignedIn, user)
  return isSignedIn ? (
    <Popup />
  ) : (
    <button
      onClick={() => {
        chrome.tabs.create({ url: chrome.runtime.getURL('login.html') })
      }}
    >
      登录44
    </button>
  )
}

const publishableKey = 'pk_test_ZGFyaW5nLXJoaW5vLTQ0LmNsZXJrLmFjY291bnRzLmRldiQ'
const root = createRoot(document.getElementById('root'))
root.render(
  <ClerkProvider
    publishableKey={publishableKey}
    // navigate={(to) => navigate(to)}
  >
    <PopupWrap />
  </ClerkProvider>,
)
