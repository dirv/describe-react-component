import { describeReactComponent } from 'describe-react-component'
import { ButtonComponent } from '../src/buttonComponent'

describeReactComponent(ButtonComponent, () => {

  beforeAll(() => {
    window.alert = () => {}  // TODO: it'd be nice if the framework could do this for us
  })

  withSpy(window, 'alert')

  it('display alerts when button is clicked', () => {
    click(button())  // you can also specify an id if you wish
    expect(window.alert).toHaveBeenCalledWith('You clicked me')
  })
})
