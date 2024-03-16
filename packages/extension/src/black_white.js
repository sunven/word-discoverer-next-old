import { sync_if_needed } from './common_lib'

const list_section_names = {
  wd_black_list: 'blackListSection',
  wd_white_list: 'whiteListSection',
  wd_user_vocabulary: 'vocabularySection',
}

function process_delete_simple(list_name, key) {
  chrome.storage.local.get([list_name], function (result) {
    const user_list = result[list_name]
    delete user_list[key]
    chrome.storage.local.set({ [list_name]: user_list })
    show_user_list(list_name, user_list)
  })
}

function process_delete_vocab_entry(key) {
  chrome.storage.local.get(
    ['wd_user_vocabulary', 'wd_user_vocab_added', 'wd_user_vocab_deleted'],
    function (result) {
      const user_vocabulary = result.wd_user_vocabulary
      const { wd_user_vocab_added } = result
      const { wd_user_vocab_deleted } = result
      const new_state = { wd_user_vocabulary: user_vocabulary }
      delete user_vocabulary[key]
      if (typeof wd_user_vocab_added !== 'undefined') {
        delete wd_user_vocab_added[key]
        new_state.wd_user_vocab_added = wd_user_vocab_added
      }
      if (typeof wd_user_vocab_deleted !== 'undefined') {
        wd_user_vocab_deleted[key] = 1
        new_state.wd_user_vocab_deleted = wd_user_vocab_deleted
      }
      chrome.storage.local.set(new_state, sync_if_needed)
      show_user_list('wd_user_vocabulary', user_vocabulary)
    },
  )
}

function create_button(list_name, text) {
  const result = document.createElement('button')
  result.setAttribute('class', 'deleteButton')
  result.expression_text = text
  if (list_name === 'wd_user_vocabulary') {
    result.addEventListener('click', function () {
      process_delete_vocab_entry(this.expression_text)
    })
  } else {
    result.addEventListener('click', function () {
      process_delete_simple(list_name, this.expression_text)
    })
  }
  const img = document.createElement('img')
  img.setAttribute('src', '../assets/delete.png')
  result.appendChild(img)
  return result
}

function create_label(text) {
  const result = document.createElement('span')
  result.setAttribute('class', 'wordText')
  result.textContent = text
  return result
}

function show_user_list(list_name, user_list) {
  const keys = []
  Object.keys(user_list).forEach((key) => {
    if (user_list.hasOwnProperty(key)) {
      keys.push(key)
    }
  })
  const section_name = list_section_names[list_name]
  const div_element = document.getElementById(section_name)
  while (div_element.firstChild) {
    div_element.removeChild(div_element.firstChild)
  }
  if (!keys.length) {
    div_element.appendChild(
      create_label(chrome.i18n.getMessage('emptyListError')),
    )
    div_element.appendChild(document.createElement('br'))
    return
  }
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (key.indexOf("'") !== -1 || key.indexOf('"') !== -1) {
      continue
    }
    div_element.appendChild(create_button(list_name, key))
    div_element.appendChild(create_label(key))
    div_element.appendChild(document.createElement('br'))
  }
}

function process_display() {
  let list_name = ''
  // TODO replace this clumsy logic by adding a special "data-list-name" attribute and renaming all 3 tags to "userListSection"
  if (document.getElementById('blackListSection')) {
    list_name = 'wd_black_list'
  } else if (document.getElementById('whiteListSection')) {
    list_name = 'wd_white_list'
  } else {
    list_name = 'wd_user_vocabulary'
  }

  chrome.storage.local.get([list_name], function (result) {
    const user_list = result[list_name]
    show_user_list(list_name, user_list)
  })
}

document.addEventListener('DOMContentLoaded', function (event) {
  process_display()
})
