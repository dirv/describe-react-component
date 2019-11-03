import { describeComponent, expectComponent, elementWithId, elementWithClass } from 'describe-react-component'
import { MyComponent } from '../src/myComponent'

describeComponent(MyComponent, () => {
  expectComponent
    .mounted()
    .toRender(elementWithId('bold'))
    .asTest()

  expectComponent
    .mounted()
    .toRender(elementWithClass('testing'))
    .asTest()

  expectComponent
    .mounted()
    .toNotRender(elementWithClass('testing'))
    .asTest()
})
