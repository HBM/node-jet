import { castMessage, MethodRequest } from '../src/3_jet/messages'
import { InvalidArgument, invalidRequest } from '../src/3_jet/errors'
describe('Testing message casting', () => {
  it('Id error', () => {
    expect(() => castMessage<MethodRequest>({} as any)).toThrow(
      new invalidRequest('no method')
    )
  })
  it('Method error', () => {
    expect(() => castMessage<MethodRequest>({ id: 'abc' } as any)).toThrow(
      new invalidRequest('no method')
    )
  })

  it('Should parse Info', () => {
    const msg = castMessage<MethodRequest>({ id: 'abc', method: 'info' } as any)
    expect(typeof msg).toEqual('object')
  })
  it('Configure error', () => {
    expect(() =>
      castMessage<MethodRequest>({
        id: 'abc',
        method: 'configure',
        params: { foo: 'bar' }
      } as any)
    ).toThrow(new InvalidArgument('no method'))
  })
  it('Should parse Configure', () => {
    const msg = castMessage<MethodRequest>({
      id: 'abc',
      method: 'configure',
      params: { name: 'Peer 1' }
    } as any)
    expect(typeof msg).toEqual('object')
  })
  it('Add without path', () => {
    expect(() =>
      castMessage<MethodRequest>({ id: 'abc', method: 'add' })
    ).toThrow(new InvalidArgument('no method'))
  })
  it('Should parse Add', () => {
    const msg = castMessage<MethodRequest>({
      id: 'abc',
      method: 'add',
      params: { path: 'myFunction' }
    })
    expect(typeof msg).toEqual('object')
  })
  it('Remove without path', () => {
    expect(() =>
      castMessage<MethodRequest>({ id: 'abc', method: 'remove' })
    ).toThrow(new InvalidArgument('no method'))
  })
  it('Should parse Remove', () => {
    const msg = castMessage<MethodRequest>({
      id: 'abc',
      method: 'remove',
      params: { path: 'myFunction' }
    })
    expect(typeof msg).toEqual('object')
  })
  it('fetch without id', () => {
    expect(() =>
      castMessage<MethodRequest>({
        id: 'abc',
        method: 'fetch',
        params: { path: { equals: 'foo' } }
      })
    ).toThrow(new InvalidArgument('no method'))
  })
  it('Should parse fetch', () => {
    const msg = castMessage<MethodRequest>({
      id: 'abc',
      method: 'fetch',
      params: { path: { equals: 'foo' }, id: '__f__1' }
    })
    expect(typeof msg).toEqual('object')
  })
  it('Unfetch without path', () => {
    expect(() =>
      castMessage<MethodRequest>({ id: 'abc', method: 'unfetch' })
    ).toThrow(new InvalidArgument('Fetch id required'))
  })
  it('Should parse Unfetch', () => {
    const msg = castMessage<MethodRequest>({
      id: 'abc',
      method: 'unfetch',
      params: { id: '__f__1' }
    })
    expect(typeof msg).toEqual('object')
  })
  it('Change without value', () => {
    expect(() =>
      castMessage<MethodRequest>({
        id: 'abc',
        method: 'change',
        params: { path: 'foo' }
      })
    ).toThrow(new InvalidArgument('Value required'))
  })
  it('Should parse change', () => {
    const msg = castMessage<MethodRequest>({
      id: 'abc',
      method: 'change',
      params: { path: 'foo', value: 4 }
    })
    expect(typeof msg).toEqual('object')
  })
})
