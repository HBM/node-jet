import State from '../../src/3_jet/peer/state'
import { ValueType } from '../../src/3_jet/types'
import { invalidState } from '../../src/jet'
describe('Testing Method', () => {
  it('Should create Method', (done) => {
    const state = new State('foo', 5)
    expect(state.path()).toEqual('foo')
    expect(state.value()).toEqual(5)
    state.addListener('change', (newValue) => {
      expect(newValue).toEqual(8)
      done()
    })
    state.value(8)
  })
  it('Should create json from state', () => {
    const state = new State<ValueType>('foo', {})
    expect(state.toJson()).toEqual({ path: 'foo', value: {} })
    const st2 = new State('foo', 5, true)
    expect(st2.toJson()).toEqual({
      path: 'foo',
      // access: { id: "usr" },
      value: 5
    })
  })
  it('State path error', () => {
    const path = undefined as unknown as string
    expect(() => new State<ValueType>(path, {})).toThrow(invalidState)
  })
})
