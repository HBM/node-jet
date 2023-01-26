import {
  ConnectionClosed,
  ConnectionInUse,
  FetchOnly,
  InvalidArgument,
  invalidMethod,
  invalidRequest,
  JSONRPCError,
  methodNotFoundError,
  ParseError,
  PeerTimeout
} from '../src/3_jet/errors'
describe('Testing errors', () => {
  it('PeerTimeoutError', () => {
    const err = new PeerTimeout()
    expect(err).toBeInstanceOf(JSONRPCError)
    expect(err).toBeInstanceOf(PeerTimeout)
    expect(err.code).toEqual(-32001)
    expect(err.name).toEqual('jet.PeerTimeout')
  })
  it('FetchOnly', () => {
    const err = new FetchOnly()
    expect(err).toBeInstanceOf(JSONRPCError)
    expect(err).toBeInstanceOf(FetchOnly)
    expect(err.code).toEqual(-32602)
    expect(err.name).toEqual('jet.FetchOnly')
  })
  it('ParseError', () => {
    const err = new ParseError()
    expect(err).toBeInstanceOf(JSONRPCError)
    expect(err).toBeInstanceOf(ParseError)
    expect(err.code).toEqual(-32600)
    expect(err.name).toEqual('jet.ParseError')
  })
  it('InvalidRequest', () => {
    const err = new invalidRequest()
    expect(err).toBeInstanceOf(JSONRPCError)
    expect(err).toBeInstanceOf(invalidRequest)
    expect(err.code).toEqual(-32600)
    expect(err.name).toEqual('jet.invalidRequest')
  })
  it('methodNotFoundError', () => {
    const err = new methodNotFoundError()
    expect(err).toBeInstanceOf(JSONRPCError)
    expect(err).toBeInstanceOf(methodNotFoundError)
    expect(err.code).toEqual(-32601)
    expect(err.name).toEqual('jet.MethodNotFound')
  })

  it('ConnectionInUse', () => {
    const err = new ConnectionInUse()
    expect(err).toBeInstanceOf(JSONRPCError)
    expect(err).toBeInstanceOf(ConnectionInUse)
    expect(err.code).toEqual(-32002)
    expect(err.name).toEqual('jet.ConnectionInUse')
  })
  it('ConnectionClosed', () => {
    const err = new ConnectionClosed()
    expect(err).toBeInstanceOf(JSONRPCError)
    expect(err).toBeInstanceOf(ConnectionClosed)
    expect(err.code).toEqual(-32002)
    expect(err.name).toEqual('jet.ConnectionClosed')
  })
  it('InvalidArgument', () => {
    const err = new InvalidArgument()
    expect(err).toBeInstanceOf(JSONRPCError)
    expect(err).toBeInstanceOf(InvalidArgument)
    expect(err.code).toEqual(-32602)
    expect(err.name).toEqual('jet.InvalidArgument')
  })
  it('InvalidMethod', () => {
    const err = new invalidMethod()
    expect(err).toBeInstanceOf(JSONRPCError)
    expect(err).toBeInstanceOf(invalidMethod)
    expect(err.code).toEqual(-32600)
    expect(err.name).toEqual('jet.invalidMethod')
  })

  it('FetchOnly', () => {
    const err = new FetchOnly()
    expect(err).toBeInstanceOf(JSONRPCError)
    expect(err).toBeInstanceOf(FetchOnly)
    expect(err.code).toEqual(-32602)
    expect(err.name).toEqual('jet.FetchOnly')
  })
})
