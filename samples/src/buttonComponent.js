import React from 'react'
import ReactDOM from 'react-dom'

export const ButtonComponent = () => {
  return (
      <button onClick={() => window.alert('You clicked me')}>Click me</button>
  )
}

