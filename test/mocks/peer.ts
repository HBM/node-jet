import * as JsonRPC from '../../src/2_jsonrpc'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fullFetcherPeer = (): any => {
  const peer = {
    ...(jest.createMockFromModule('../../src/2_jsonrpc') as JsonRPC.JsonRPC),
    connect: () => Promise.resolve(),
    callbacks: {},
    close: jest.fn(),
    _isOpen: true,
    respond: jest.fn(),
    send: jest.fn(),
    queue: jest.fn(),
    config: {},
    sendRequest: jest
      .fn()
      .mockImplementation((method) =>
        method === 'info'
          ? Promise.resolve({ features: { fetch: 'full' } })
          : Promise.resolve([])
      )
  }
  peer.addListener = (evt: string, cb) => {
    if (!(evt in peer.callbacks)) peer.callbacks[evt] = []
    peer.callbacks[evt].push(cb)
    return peer
  }
  return peer
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const simpleFecherPeer = (): any => {
  const peer = {
    ...(jest.createMockFromModule('../../src/2_jsonrpc') as JsonRPC.JsonRPC),
    connect: () => Promise.resolve(),
    callbacks: {},
    config: {},
    _isOpen: true,
    respond: jest.fn(),
    send: jest.fn(),
    queue: jest.fn(),
    sendRequest: jest
      .fn()
      .mockImplementation((method) =>
        method === 'info'
          ? Promise.resolve({ features: { fetch: 'simple' } })
          : Promise.resolve([])
      )
  }
  peer.addListener = (evt: string, cb) => {
    if (!(evt in peer.callbacks)) peer.callbacks[evt] = []
    peer.callbacks[evt].push(cb)
    return peer
  }
  return peer
}
