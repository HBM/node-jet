import * as server from '../../src/2_jsonrpc/server'
import { MethodRequest } from '../../src/3_jet/messages'
import { Peer } from '../../src/jet'

export const jsonRPCServer = (): server.JsonRPCServer & {
  simulateConnection: (peer: Peer) => Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  simulateDisconnect: (peer: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: (peer: any, msg: any) => any
} => {
  let cbs: { ({ id, message, success }): void }[] = []
  const mock = {
    ...(jest.createMockFromModule(
      '../../src/2_jsonrpc/server'
    ) as server.JsonRPCServer),
    listen: () => {
      //do nothing
    },
    callbacks: {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    simulateConnection: (_peer: any) => Promise.resolve(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    simulateDisconnect: (_peer: any) => Promise.resolve(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    message: (_peer: any, msg: MethodRequest) => {
      //do nothing
    },
    close: () => {
      //do nothing
    }
  }

  mock.addListener = (evt: string, cb) => {
    if (!(evt in mock.callbacks)) mock.callbacks[evt] = []
    mock.callbacks[evt].push(cb)
    return mock
  }
  mock.simulateConnection = (peer) => {
    mock.callbacks['connection'].forEach((cb) => cb(peer))
    jest.spyOn(peer, 'respond').mockImplementation((id, message, success) => {
      cbs.forEach((cb) => cb({ id: id, message: message, success: success }))
    })
    return Promise.resolve()
  }

  mock.message = (peer, msg: MethodRequest) => {
    return new Promise((resolve) => {
      const check = ({ id, message, success }) => {
        if (id === msg.id) {
          cbs = cbs.filter((cb) => cb !== check)
          resolve({ id: id, message: message, success: success })
        }
      }
      cbs.push(check)
      peer.callbacks[msg.method].forEach((cb) => cb(peer, msg.id, msg.params))
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mock.simulateDisconnect = (peer: any) => {
    mock.callbacks['disconnect'].forEach((cb) => cb(peer))
    return Promise.resolve()
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mock as any
}
