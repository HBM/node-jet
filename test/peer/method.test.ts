import { Peer } from '../../src/3_jet/peer'
import * as JsonRPC from '../../src/2_jsonrpc/index'
import Method from '../../src/3_jet/peer/method'
import State from '../../src/3_jet/peer/state'
import { ValueType } from '../../src/3_jet/types'
import { Fetcher } from '../../src/jet'
describe('Testing Method', () => {
  it('Should create Method', (done) => {
    const method = new Method('foo')
    expect(method.path()).toEqual('foo')
    method.addListener('call', (args) => {
      expect(args).toEqual([1, 2, 3])
      done()
    })
    method.call([1, 2, 3])
  })
  it('Should create json from Method', () => {
    let method = new Method('foo')
    expect(method.toJson()).toEqual({ path: 'foo' })
    method = new Method('foo', { id: 'usr' })
    expect(method.toJson()).toEqual({ path: 'foo', access: { id: 'usr' } })
  })
})
