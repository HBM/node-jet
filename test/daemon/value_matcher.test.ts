import { InvalidArgument } from '../../src/jet'
import { create } from '../../src/3_jet/daemon/value_matcher'
import { FetchParams } from '../../src/3_jet/messages'
describe('Testing Value matcher', () => {
  it('Should test greater than', () => {
    const params = {
      path: {},
      sort: {},
      id: '',
      value: { '': { operator: 'greaterThan', value: 5 } }
    } as FetchParams
    const matcher = create(params)
    expect([4, 5, 6].filter((el) => matcher(el))).toEqual([6])
  })
  it('Should test less than', () => {
    const params = {
      path: {},
      sort: {},
      id: '',
      value: { '': { operator: 'lessThan', value: 5 } }
    } as FetchParams
    const matcher = create(params)
    expect([4, 5, 6].filter((el) => matcher(el))).toEqual([4])
  })
  it('Should test equal', () => {
    const params = {
      path: {},
      sort: {},
      id: '',
      value: { '': { operator: 'equals', value: 5 } }
    } as FetchParams
    const matcher = create(params)
    expect([4, 5, 6].filter((el) => matcher(el))).toEqual([5])
  })
  it('Should test equals not', () => {
    const params = {
      path: {},
      sort: {},
      id: '',
      value: { '': { operator: 'equalsNot', value: 5 } }
    } as FetchParams
    const matcher = create(params)
    expect([4, 5, 6].filter((el) => matcher(el))).toEqual([4, 6])
  })
  it('Should test is Type', () => {
    const params = {
      path: {},
      sort: {},
      id: '',
      value: { '': { operator: 'isType', value: 'number' } }
    } as FetchParams
    const matcher = create(params)
    expect([4, '5', 6].filter((el) => matcher(el))).toEqual([4, 6])
  })
  it('Should test invalid operator', () => {
    const params = {
      path: {},
      sort: {},
      id: '',
      value: { '': { operator: 'foo', value: 'number' } }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    expect(() => create(params)).toThrow(new InvalidArgument())
  })
  it('Should test invalid values', () => {
    const params = {
      path: {},
      sort: {},
      id: '',
      value: { '': { operator: 'greaterThan', value: 5 } }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    const matcher = create(params)
    expect([{ id: 4 }, undefined, 6].filter((el) => matcher(el))).toEqual([6])
  })
  it('Should test no value', () => {
    const params = {
      path: {},
      sort: {},
      id: ''
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    const matcher = create(params)
    expect([4, '5', 6].filter((el) => matcher(el))).toEqual([4, '5', 6])
  })
})
