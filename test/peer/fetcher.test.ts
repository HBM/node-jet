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
})
