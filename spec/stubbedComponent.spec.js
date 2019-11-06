import { describeReactComponent } from '../src/describeReactComponent'
import { A, B } from '../src/stubbedComponent'

describeReactComponent(B, () =>  {
  withComponentSpy(A)

  it('renders an A', () => {
    expect(spy(A)).toHaveBeenCalled()
    expect(spy(A)).toHaveBeenCalledWith({ prop1: true, prop2: 'hello' }, {})

    // the spy stubs out the component with a div named spy-<componentName>
    expect(element('div[id="spy-A"]')).not.toBeNull()

    // OR PUT THOSE TOGETHER USING... (TODO)
    // expect(spy(A)).toHaveBeenRendered()
    // expect(spy(A)).toHaveBeenRenderedWith({ prop1: true, prop2: 'hello' })
  })
})
