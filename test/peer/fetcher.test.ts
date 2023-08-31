import { Fetcher } from '../../src/jet'
describe('Testing Fetcher', () => {
  it('Should create Fetcher', () => {
    const fetch = new Fetcher()
      .path('equals', 'test')
      .sortByValue()
      .sortByValue('id')
      .sortByPath()
      .value('equals', 5)
      .value('equals', 3, 'user.id')
      .range(4, 6)
      .descending()
      .ascending()
      .differential()

    expect(fetch.matches('test', { user: { id: 3 } })).toEqual(false)
  })
  it('Should create differential Fetcher', () => {
    const fetch = new Fetcher().path('equals', 'test').differential()
    expect(fetch.matches('test', { user: { id: 3 } })).toEqual(true)
  })
  it('Should create ascending Fetcher', () => {
    const fetch = new Fetcher().path('equals', 'test').ascending()
    expect(fetch.matches('test', { user: { id: 3 } })).toEqual(true)
  })
  it('Should create descending Fetcher', () => {
    const fetch = new Fetcher().path('equals', 'test').descending()
    expect(fetch.matches('test', { user: { id: 3 } })).toEqual(true)
  })
  it('Should create range Fetcher', () => {
    const fetch = new Fetcher().path('equals', 'test').range(0, 2)
    expect(fetch.matches('test', { user: { id: 3 } })).toEqual(true)
  })
  it('Should create sorted Fetcher', () => {
    const fetch = new Fetcher().path('equals', 'test').sortByPath()
    expect(fetch.matches('test', { user: { id: 3 } })).toEqual(true)
  })
})
