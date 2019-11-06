import { describeReactComponent } from 'describe-react-component'
import { MyComponent } from '../src/myComponent'

describeReactComponent(MyComponent, () => {
  whenMounted(() => {
    it("renders bold element", () => {
      expect(elementWithId('bold')).not.toBeNull()
    })

    it("renders testing element", () => {
      expect(elementWithClass('testing')).not.toBeNull()
    })

    it("does not render extra text", () => {
      expect(container().textContent).not.toContain('extra stuff')
    })

    it("renders extra text if showExtra prop is true", () => {
      mountWithProps({ showExtra: true })
      expect(container().textContent).toContain('extra stuff')
    })
  })
})
