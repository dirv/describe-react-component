import React from 'react'
import ReactDOM from 'react-dom'
// Decision: Use global state. Jest gives each test suite its own global context.
// May wish to name these something __container, __component to avoid user clashes
let container, component, currentTestContext

const resetCurrentTestContext = () =>
  currentTestContext = { arrange: [], act: [], assert: [] }

const setupComponent = () => {
  beforeEach(() => {
    container = document.createElement('div')
    //setupStubs()
  })

  afterEach(() => {
    container.remove()
  })
}

export const describeComponent = (describedComponent, definition) => {
  component = describedComponent
  currentTestContext = resetCurrentTestContext()
  describe(component.name, () => {
    setupComponent()
    definition()
  })
}

const mounted = () => {
  currentTestContext = {
    ...currentTestContext,
    act: [ ...currentTestContext.act, new RenderAction({}) ] }
  return expectComponent
}

const mountedWithProps = (props) => {
  currentTestContext = {
    ...currentTestContext,
    act: [ ...currentTestContext.act, new RenderAction(props) ] }
  return expectComponent
}

const whenSubmitting = (selector) => {
  currentTestContext = {
    ...currentTestContext,
    act: [ ...currentTestContext.act, new SubmitAction(selector) ] }
  return expectComponent
}

const afterPromisesComplete = () => {
  currentTestContext = {
    ...currentTestContext,
    act: [ ...currentTestContext.act, new WaitAction() ] }
  return expectComponent
}

class RenderAction {
  constructor(props) {
    this.props = props
  }

  run = () => {
    ReactDOM.render(React.createElement(component, this.props, {}), container)
  }

  toDescription = () => "component mounts"
}

class WaitAction {
  run = async () => {
    await new Promise(setTimeout)
  }

  // TODO: maybe skip this one out?
  toDescription = () => "waiting for tasks to complete"
}

////////////////////////////////////
// assert
//

const toFetchData = (...args) => {
  currentTestContext = {
    ...currentTestContext,
    assert: [ ...context.assert, new SpyAssert(window, 'fetch').with(...args) ] }
  return expectComponent
}

class SpyAssert {
  constructor(spyObject, spyFunction) {
    this.spyObject = spyObject
    this.spyFunction = spyFunction
  }

  // TODO: allow settings props here
  with = (...args) => {
  }

  toExpectation = () => {
    expect(spyObject, spyFunction).toHaveBeenCalled()
  }
}

const push = (property, newItem) => {
  currentTestContext = {
    ...currentTestContext,
    [property]: [ ...currentTestContext[property], newItem ]}
  return expectComponent
}

const toRender = selector => push('assert', new RenderAssert(selector, false))
const toNotRender = selector => push('assert', new RenderAssert(selector, true))

// TODO: this function doesn't work if I try to use it in place of try/catch below.
// Reason: the stack trace gets clobbered at some point again as it bubbles out of
// this function and back into toExpectation.
const fakeStackTrace = (fn, { stack }) => {
  try {
    fn()
  } catch(e) {
    e.stack = stack
    throw e;
  }
}


class RenderAssert {
  constructor(selector, not) {
    this.selector = selector
    this.not = not
  }

  toExpectation = (context) => {
    if (this.not) {
      try {
        expect(this.selector.element()).toBeNull()
      } catch (e) {
        e.stack = context.stack
        // The next line throws the error again.
        // There is actually another way to do this, which is to
        // rely on the global Jest test context to push a suppressedError
        // I haven't done that because I don't want to rely too much
        // on their internals, but here's how it would be done.
        // import { getState } from 'expect/build/jestMatchersObject'
        // getState().suppressedErrors.push(error)
        throw e;
      }
    } else {
      expect(this.selector.element()).not.toBeNull()
    }
  }

  toDescription = () => {
    if (this.not) {
      return `does not render ${this.selector.toDescription()}`
    } else {
      return `renders ${this.selector.toDescription()}`
    }
  }
}

class SimpleSelector {
  selectors = [
    { name: 'submitButton', selector: _ => 'input[type="submit"]', description: 'submit button' },
    { name: 'formWithId', selector: id => `form[id="${id}"]`, description: 'form' },
    { name: 'elementWithId', selector: id => `#${id}`, description: id => `element with id '${id}'` },
    { name: 'elementWithClass', selector: name => `.${name}`, description: name => `element with class '${name}'` }
  ]

  constructor(name, value) {
    this.name = name
    this.value = value
    this.property = {}
  }

  element = () => container.querySelector(this.selector().selector(this.value))

  withPropertyValue = (prop, value) => {
    this.property = {
      name: prop,
      value: value
    }
  }

  selector = () => this.selectors.find(s => s.name === this.name)

  // TODO: describe property values other than disabled/enabled
  toDescription = () => {
    if (this.property.name === "disabled") {
      if (this.property.value === true) return `a disabled ${this.selectorDescription()}`
      if (this.property.value === false) return `an enabled ${this.selectorDescription()}`
    }
    return this.selectorDescription()
  }

  selectorDescription = () =>
    this.selector().description(this.value)
}

export const submitButton = () => new SimpleSelector('submitButton')
export const formWithId = (id) => new SimpleSelector('formWitId', name)
export const elementWithId = (id) => new SimpleSelector('elementWithId', id)
export const elementWithClass = (name) => new SimpleSelector('elementWithClass', name)

const disabled = selector => selector.withPropertyValue('disabled', 'true')
const enabled = selector => selector.withPropertyValue('disabled', 'false')

const buildTestDescription = ({ act, assert }) =>
  `${expectationDescription(assert)} when ${actionDescription(act)}`

const expectationDescription = assert =>
  assert.map(expectation => expectation.toDescription()).join(' and ')

const actionDescription = act =>
  act[act.length - 1].toDescription()

const cleanStackTraceOfThisModule = context => {
  context.stack = context.stack
    .split('\n')
    .filter(line => !line.includes('/node_modules/expect-component'))
    .join('\n')
}

const setFakeStackTraceAtThisPoint = context => {
  Error.captureStackTrace(context, asTest)
  cleanStackTraceOfThisModule(context)
}

const asTest = () => {
  const thisContext = currentTestContext
  setFakeStackTraceAtThisPoint(thisContext)
  it(buildTestDescription(currentTestContext), () => {
    const { act, assert } = thisContext
    act.forEach(action => action.run())
    assert.forEach(expectation => expectation.toExpectation(thisContext))
  })
  resetCurrentTestContext()
}

export const expectComponent = {
  mounted,
  toRender,
  toNotRender,
  toFetchData,
  asTest
}

// TODO: how will this work with component exports
const withStubs = stubs =>
  Object.entries(stubs).forEach(([f, returnValue]) =>
    jest.spyOn(f).mockReturnValue(returnValue))
