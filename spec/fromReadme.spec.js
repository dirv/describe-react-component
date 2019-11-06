import React, { useEffect, useState } from 'react'
import { describeReactComponent } from '../src/describeReactComponent'

const A = () => <div><p>Hello, world!</p></div>

describeReactComponent(A, () => {
  it('renders a Hello, world message', () => {
    expect(container().textContent).toEqual('Hello, world!')
  })
})

describeReactComponent(A, () => {
  it('renders a _Hello, world_ message', () => {
    expect(container().textContent).toEqual('Hello, world!')
  })
})

const A2 = ({ firstName }) => <div><p>Hello, {firstName}!</p></div>

describeReactComponent(A2, () => {
  it('renders a _Hello, Jack_ message', () => {
    mountWithProps({ firstName: 'Jack' })
    expect(container().textContent).toEqual('Hello, Jack!')
  })
})

describeReactComponent(A2, () => {
  withProps({ firstName: 'Jack' })

  it('renders a _Hello, Jack_ message', () => {
    expect(container().textContent).toEqual('Hello, Jack!')
  })
})

const F = () => {
  useEffect(() => {
    window.fetch('/myapi', { mode: 'origin' })
  }, [])

  return <div />
}

describeReactComponent(F, () => {
  withSpy(window, 'fetch')

  it('calls window.fetch with /myapi', () => {
    mount()
    expect(window.fetch).toHaveBeenCalledWith('/myapi', { mode: 'origin' })
  })
})

const F2 = () => {
  const [ message, setMessage ] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const response = await window.fetch('/myapi', { mode: 'origin' })
      setMessage(await response.json())
    }
    fetchData()
  }, [])

  return <div>{message}</div>
}

describeReactComponent(F2, () => {
  const message = 'Hello, world!'
  withStub(window, 'fetch', fetchResponseOk(message))

  it('renders the message returned from the window.fetch call', async () => {
    await mountAndWait()
    expect(container().textContent).toEqual(message)
  })
})

const P = () => <><F /></>

describeReactComponent(P, () => {
  withComponentSpy(F)

  it('renders F', () => {
    expect(F).toHaveBeenRendered()
  })
})

const P2 = () => <><F randomProp={123} blah={12} /></>

describeReactComponent(P2, () => {
  withComponentSpy(F)

  it('renders F', () => {
    mount()
    expect(F).toHaveBeenRenderedWithProps({ randomProp: 123 })
  })
})
