# describe-react-component

An opinionated TDD framework for React components that works with the Jest test runner. Its purpose is to remove all of the boilerplate necessary for writing effective tests. Using this library will help you produce tests that focused on behavior and data rather than test setup. That means your tests will be shorter, more consistent, less brittle and better at pinpointing errors.

The "catch" (if you can call it that) is that you'll want ot write your tests the way the library wants you to write them. If you're not used to this style of testing then it may be a bit of a culture shock.

We'll look at examples soon, but first let's go over the main principles.

## The principles

 * Each `describe` block tests exactly one component.
 * Each test follows the Arrange-Act-Assert style of test.
 * All tests involve mounting the component using `ReactDOM.render`. There's no shallow testing (see the final bullet point).
 * Each test gets its own container (using JSDOM), with a freshly mounted component. That way your tests remain independent.
 * Since all your tests will involve mounting a component, you can omit this and the framework will mount it for you (examples below).
 * Assertions are either against the container or against your spies.
 * There is only one type of test double: stubs. However, these stubs also act as spies.
 * Instead of shallow rendering, you stub out child components, just like you would stub out dependencies to functions or classes.


## The output of a failed test


```
  ● MyComponent › does not render element with class 'testing' when component mounts

    expect(received).toBeNull()

    Received: <div class="testing"><b id="bold">test text</b></div>

      16 |     .mounted()
      17 |     .toNotRender(elementWithClass('testing'))
    > 18 |     .asTest()
         |      ^
      19 | })
      20 |

      at spec/myComponent.spec.js:18:6
      at Object.<anonymous> (spec/myComponent.spec.js:4:1)
```

## How to build

    npm run build


