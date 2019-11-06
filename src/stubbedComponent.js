import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'

export const A = ({ prop1, prob2 }) => {

  return <b>do not render</b>
}

export const B = () => {

  return (
    <>
      <A prop1={true} prop2={'hello'} />
    </>
  )
}
