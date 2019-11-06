import React from 'react'
import ReactDOM from 'react-dom'

export const MyComponent = ({ showExtra }) => {
  return (
    <div>
      <div className="testing"><b id="bold">test text</b></div>
      { showExtra && <p>Some extra stuff</p>}
    </div>
  )
}

