import React from 'react'
import ReactDOM from 'react-dom'
import ReactTestUtils, {  act } from 'react-dom/test-utils'
import { mockComponent, useMockableComponent, createMockableElement, clearRegistry } from './mockableComponent'
import { fetchResponseOk, fetchResponseError } from './spyHelpers'

let __component, __container, __currentTestContext

const resetCurrentTestContext = (component) => {
  __component = component
  __currentTestContext = {
    hasMounted: false,
    props: {}
  }
}

const setupContainer = () => {
  beforeEach(() => {
    __container = document.createElement('div')
  })

  afterEach(() => {
    __container.remove()
  })
}

//const container = () => __container

//////////////////////////////
// describe-level helpers
const whenMounted = testDefinitions =>
  describe("when initially mounted", testDefinitions)

const selectors = [
  { name: 'container', selector: _ => 'div', description: '' }, // this doesn't work
  { name: 'button', selector: id => id ? 'button[id="${id}"]' : 'button', description: 'button' },
  { name: 'submitButton', selector: _ => 'input[type="submit"]', description: 'submit button' },
  { name: 'formWithId', selector: id => `form[id="${id}"]`, description: 'form' },
  { name: 'element', selector: s => s, description: s => `element matching selector ${s}` },
  { name: 'elementWithId', selector: id => `#${id}`, description: id => `element with id '${id}'` },
  { name: 'elementWithClass', selector: name => `.${name}`, description: name => `element with class '${name}'` }
]

const actions = [
  { name: 'click' },
  { name: 'submit' }
]

const applySelector = selector =>
  global[selector.name] = value => {
    mountIfNotAlreadyMounted()
    return __container.querySelector(selector.selector(value))
  }

const applyAction = action =>
  global[action.name] = (node, eventData) => {
    mountIfNotAlreadyMounted()
    ReactTestUtils.Simulate[action.name](node, eventData)
  }

const applySelectors = () => selectors.forEach(applySelector)
const applyActions = () => actions.forEach(applyAction)

export const describeReactComponent = (describedComponentType, definition) => {
  global.whenMounted = whenMounted
  global.withProps = withProps
  global.withComponentSpy = withComponentSpy
  global.withSpy = withSpy
  global.withStub = withStub
  global.spy = spy
  global.createMockableElement = createMockableElement
  global.container = () => {
    mountIfNotAlreadyMounted()
    return __container
  }
  global.mount = mount
  global.mountAndWait = mountAndWait
  global.mountWithProps = mountWithProps
  global.mountAndWaitWithProps = mountAndWaitWithProps

  global.fetchResponseOk = fetchResponseOk
  global.fetchResponseError = fetchResponseError
  //global[it.auto] = generatedIt
  applySelectors()
  applyActions()

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe(describedComponentType.name, () => {
    beforeEach(() => resetCurrentTestContext(describedComponentType))
    setupContainer()
    definition()
  })
}

const mountIfNotAlreadyMounted = () => {
  if (!__currentTestContext.hasMounted)
    mount()
}

const mount = () =>
  mountWithProps({})

const mountWithProps = props => {
  // act is needed here to ensure hooks run
  act(() => {
    ReactDOM.render(
      React.createElement(
        __component,
        { ...__currentTestContext.props, ...props },
        {}),  // TODO: no support for children yet
      __container)
  })
  __currentTestContext.hasMounted = true
}

// TODO: what if you try to run this within a test
const withProps = props => {
  beforeEach(() => {
    __currentTestContext.props = { ...__currentTestContext.props, ...props }
  })
}

const spyElementId = fn => `spy-${fn.name}`

const withComponentSpy = (fnComponent) => {
  // TODO: warn if you pass null
  // TODO: somehow make this work within an it.
  beforeEach(() => {
    const spy = jest.fn(() => <div id={spyElementId(fnComponent)}></div>)
    mockComponent(fnComponent, spy)
  })

  // TODO: this only needs to be called once per test, not once per spy
  afterEach(() => {
    clearRegistry()
  })
}

const mountAndWait = async () => {
  await act(async () => {
    mount()
  })
}

const mountAndWaitWithProps = async props => {
  await act(async () => {
    mountWithProps(props)
  })
}

const withSpy = (object, propertyName) => {
  // TODO: add support for returning async undefined?
  // Not sure withSpy is really all that useful on its own.
  withStub(object, propertyName, () => undefined)
}

// TODO: ok, so this needs some thought
const setFunctionIfNotFunction = (object, propertyName) => {
  if (!object.propertyName) {
    object[propertyName] = () => undefined
  }
};

const withStub = (object, propertyName, fn) => {
  // TODO: support for spy
  // TODO: this should perhaps be run in the beforeEach
  setFunctionIfNotFunction(object, propertyName)

  beforeEach(() => {
    jest.spyOn(object, propertyName).mockImplementation(fn)
  })
}

const spy = (fnComponent) => {
  // TODO: warn if you pass null
  mountIfNotAlreadyMounted()
  return useMockableComponent(fnComponent)
}

const disabled = selector => selector.withPropertyValue('disabled', 'true')
const enabled = selector => selector.withPropertyValue('disabled', 'false')

const wasRendered = spy => elementWithId(spyElementId(spy)) !== null

const spyWasCalled = (spy, props) =>
  spy.mock.calls.find(call => expect.objectContaining(props).asymmetricMatch(call[0]))

expect.extend({
  toHaveBeenRenderedWithProps(received, props) {
    if (wasRendered(received) && spyWasCalled(useMockableComponent(received), props)) {
      // TODO: this is a bit crap as it could fail for either reason.
      // this expectation is maybe not a good idea
      return {
        pass: true,
        message: () => `expected ${received.name} not to have been rendered with props`
      }
    } else {
      // TODO: better message depending on if it was the fact it wasn't rendered or if it wasn't rendered with the right props
      return {
        pass: false,
        message: () => `expected ${received.name} to have been rendered with props but it wasn't`
      }
    }
  },

  toHaveBeenRendered(received) {
    if (wasRendered(received)) {
      return {
        pass: true,
        message: () => `expected ${received.name} not to have been rendered`
      }
    } else {
      return {
        pass: false,
        message: () => `expected ${received.name} to have been rendered`
      }
    }
  }
})
