import React from 'react'

export default function Bubble() {
  return (
    <div id="wd_selection_bubble" className="wdSelectionBubble">
      <span id="wd_selection_bubble_text" className="wdInfoSpan"></span>
      <span id="wd_selection_bubble_freq" className="wdFreqSpan"></span>
      <div className="addAndAudioWrap">
        <button className="wdAddButton"></button>
        <button className="wdAddButton"></button>
      </div>
      <div id="wdn_translate_bing"></div>
    </div>
  )
}
