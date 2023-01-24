import * as server from '../../src/2_jsonrpc/server'
import { MethodRequest } from '../../src/3_jet/messages'
import { EventType } from '../../src/3_jet/types'
import { Peer } from '../../src/jet'

export const jsonRPCServer = (): server.JsonRPCServer & {
  simulateConnection: (peer: Peer) => Promise<void>
  simulateDisconnect: (peer: any) => void
  message: (peer: any, msg: any) => any
} => {
  let cbs: Function[] = []
  const mock = {
    ...(jest.createMockFromModule(
      '../../src/2_jsonrpc/server'
    ) as server.JsonRPCServer),
    listen: () => {},
    callbacks: {},
    simulateConnection: () => Promise.resolve(),
    simulateDisconnect: () => Promise.resolve(),
    message: () => {},
    close: () => {}
  }

  mock.addListener = (evt: string, cb: Function) => {
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

  mock.simulateDisconnect = (peer: any) => {
    mock.callbacks['disconnect'].forEach((cb) => cb(peer))
    return Promise.resolve()
  }
  return mock
}
