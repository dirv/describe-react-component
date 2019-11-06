# describe-react-component

An opinionated TDD framework for React components, built for the Jest test runner. Its purpose is to remove all of the boilerplate necessary for writing effective tests. Using this library will help you produce clear, simple tests that focus on behavior and data rather than test setup. That means your tests will be shorter, more consistent, less brittle and better at pinpointing errors.

The "catch" (if you can call it that) is that you'll need to write your tests the way the library wants you to write them. If you're not used to this style of testing then it may be a bit of a culture shock.

In particular, the library does away with shallow rendering and replaces it standard spying and stubbing as you may have practiced in other languages and environments.

Examples are a little bit further below.

## The principles

 * Each `describeReactComponent` block tests exactly one component.
 * Each test follows the Arrange-Act-Assert style of test.
 * All tests involve mounting the component using `ReactDOM.render`. There's no shallow testing (see the final bullet point).  Each test gets its own container (using JSDOM), with a freshly mounted component. That way your tests remain independent.
 * Since all your tests will involve mounting a component, you can omit this and the framework will mount it for you (examples below).
 * Assertions are either against the container or against your spies.
 * There is only one type of test double: stubs. However, these stubs also act as spies.
 * Instead of shallow rendering, you stub out child components, just like you would stub out dependencies to functions or classes.

## Examples

## Installing

First, install the package.


    npm install --save-dev describe-react-component

Then modify your Babel configuration if you want spy and stub support (you probably do want this), as shown below.

### Modifying `.babelrc`

Spying and stubbing works by telling the Babel JSX transform plugin to use `createMockableElement` function instead of `React.createElement`. This is a straightforward approach to mocking that looks in a global registry of spies and stubs before forwarding the call to `React.createElement`.

To get this behaviour in your test environment, you'll need to set up your `.babelrc` file as shown below.

```
{
  "presets": ["@babel/preset-env", "@babel/preset-react"],
  "plugins": ["@babel/plugin-proposal-class-properties"],
  "env": {
    "test": {
      "plugins": [
        [ "@babel/plugin-transform-react-jsx", {
          "pragma": "createMockableElement",
          "pragmaFrag": "React.Fragment"
        }] ]
    }
  }
}
```

It's important that the `@babel/plugin-transform-react-jsx` plugin is configured for the `test` environment only; you don't want to this code running in production.

### Not using JSX?

You'll need to replace your calls to React.createElement with calls to createMockableElement instead.

import { createMockableElement } from 'describe-react-component/mockableComponent'

## Writing your first test

Imagine you have this component defined in `src/A.js`:

```
const A = () => <div><p>Hello, world!</p></div>
```

You can write a test suite for that like this:

```
import { describeReactComponent } from '../src/describeReactComponent'

describeReactComponent(A, () => {
  it('renders a Hello, world message', () => {
    mount()
    expect(container().textContent).toEqual('Hello, world!')
  })
})

```

The first argument to `describeReactComponent` is not a string like with `describe`, but instead is the component type. This is type that each of your tests will instrument.

The `mount` call is optional: if you don't call it, the call to `container` will do it for you (and so will any of the assertion helper functions--see the table below). We don't recommend one way or the other, but since each of your tests must mount the component at least once you might prefer the concise version:

```
import { describeReactComponent } from 'describe-react-component'

describeReactComponent(A, () => {
  it('renders a _Hello, world_ message', () => {
    expect(container().textContent).toEqual('Hello, world!')
  })
})
```

Now let's add in some props to `A`:

```
const A2 = ({ firstName }) => <div><p>Hello, {firstName}!</p></div>
```

There are two ways to specify props. The first is with an explicit call to mountWithProps:

```
describeReactComponent(A2, () => {
  it('renders a _Hello, Jack_ message', () => {
    mountWithProps({ firstName: 'Jack' })
    expect(container().textContent).toEqual('Hello, Jack!')
  })
})
```

The second way is to call `withProps`. This allows you to set the default set of props for a set of tests.

```
describeReactComponent(A2, () => {
  withProps({ firstName: 'Jack' })

  it('renders a _Hello, Jack_ message', () => {
    expect(container().textContent).toEqual('Hello, Jack!')
  })
})
```

Now let's say you have a component F that calls `fetch` to pull in some data.

```
const F = () => {
  useEffect(() => {
    window.fetch('/myapi', { mode: 'origin' })
  }, [])

  return <div />
}
```

We want to test that `window.fetch` is called.

```
describeReactComponent(F, () => {
  withSpy(window, 'fetch')

  it('calls window.fetch with /myapi', () => {
    expect(window.fetch).toHaveBeenCalled()
  })
})
```

What if we want to test that the response is used? We can use the `fetchResponseOk` or `fetchResponseError` helpers for that.

```
const F2 = () => {
  const [ message, setMessage ] = useState('')

  useEffect(async () => {
    const response = await window.fetch('/myapi', { mode: 'origin' })
    setMessage(await response.json())
  }, [])

  return <div>{message}</div>
}
```

Now we can use `withStub`, which is a spy but with a stubbed response. Since `window.fetch` asynchronous we need to mount and then wait for our response.

```
describeReactComponent(F2, () => {
  const message = 'Hello, world!'
  withStub(window, 'fetch', fetchResponseOk(message))

  it('renders the message returned from the window.fetch call', async () => {
    await mountAndWait()
    expect(container().textContent).toEqual(message)
  })
})
```

Finally, let's assume `F` is used in a parent component called `P`. We want to test that `P` renders `F` but we don't want F to make that call to `window.fetch`. So we spy on `F`:

```
const P = () => <><F /></>
```

You can test that using `withComponentSpy` and the `toHaveBeenRendered` matcher. Note that `P` becomes a normal Jest mock, so you could just use the standard Jest matchers here if you wanted. `toHaveBeenRendered` (and `toHaveBeenRenderedWithProps`, below) are just 'nicer' versions for React components: they both check that the component is in the tree and that it was called.

```
describeReactComponent(P, () => {
  withComponentSpy(P)

  it('renders P', () => {
    expect(P).toHaveBeenRendered()
  })
})
```

What about if `F` had some props? Then you use `toHaveBeenRenderedWithProps` instead.

```
const P2 = () => <><F randomProp={123} /></>
```

```
describeReactComponent(P2, () => {
  withComponentSpy(P)

  it('renders P', () => {
    expect(P).toHaveBeenRenderedWithProps({ randomProp: 123 })
  })
})
```

### Other bits and pieces

Further options: (these could do with better documentation)

`withMounted` - this is just an extra context that gives you a nice description of "when initially mounted" so you don't have to repeat that in your test descriptions.

# But you pollute the global namespace! This is terrible.

`describeReactComponent` splurts out a bunch of functions onto the `global` object. Since Jest gives you a fresh Node worker per test suite, we believe this to be fine.

We agree that this is ugly, but we are also pragmatists, and you're running with the context of a test suite, where clarity trumps all else. Rules are made to be broken!

## How to build

    npm run build


# TODO

* describeReactComponent.only
* Form events
* If withSpy/withStub is run in a describe, put it in a beforeEach.
  If it's in an it, just run it.
* Get act in there somewhere
* Add in event helpers
* Add spy helpers like fetchResponseError, and documentation
* Add list of all supported actions and all supported assertion helpers
* Add contributions section
* Support for testing children in spies.
* The two variants of `withSpy` are a bit yuk. So we name one `withComponentSpy`?
* Add a B component example that shows using an assertion helper like `elementWithClass`.
* Add support for `querySelectorAll` helpers.
* `createMockableElement` is installed globally by `describeReactComponent`. If you aren't using this function for all of your React component testing then JSX transforms will break, so this library probably needs a way to either apply that function when Jest launches.
* Multiple stubbed responses
* Async support
* Better support for lists / tables of info
* Nested `withProps` support - it'd probably be nice to merge these with parent? Or have a way to get at the parent context props if you want to do an explicit merge
* Documentation on resetting spy/stubs
* Document that withSpy stops the original being called
* TypeScript support
* Experiment with adding generated test descriptions, `it.auto` for common test names (e.g. renders A, fetches data when button clicked, etc)
* Is there a way we can collect usage information?


