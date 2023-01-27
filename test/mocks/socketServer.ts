import * as wsserver from '../../src/1_socket/wsserver'
import * as tcpserver from '../../src/1_socket/tcpserver'
import { MethodRequest } from '../../src/3_jet/messages'
import { EventType } from '../../src/3_jet/types'
import { Peer } from '../../src/jet'
import { Server as HTTPServer } from 'http'

type wbServer = wsserver.WebsocketServer & {
  simulateConnection: (peer: Peer) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  simulateDisconnect: (peer: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  simulateMessage: (peer: any, method: EventType, msg: MethodRequest) => any
}

export const WebsocketServer = (): wbServer => {
  let cbs: { ({ id, message, success }): void }[] = []
  const mock = {
    ...(jest.createMockFromModule(
      '../../src/1_socket/wsserver'
    ) as wsserver.WebsocketServer),
    listen: () => {
      //do nothing
    },
    callbacks: {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    simulateConnection: (_peer: any) => {
      //do nothing
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    simulateDisconnect: (_peer: any) => {
      //do nothing
    },
    simulateMessage: (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      _peer: any,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      _method: EventType,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      _msg: MethodRequest
    ) => {
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
      cbs.forEach((cb) => cb({ id, message, success }))
    })
  }

  mock.simulateMessage = (peer, method: EventType, msg: MethodRequest) => {
    peer.callbacks['message'].forEach((cb) => cb(method, msg))
    return new Promise((resolve) => {
      const check = ({ id, message, success }) => {
        if (id === msg.id) {
          cbs = cbs.filter((cb) => cb !== check)
          resolve({ id: id, message: message, success: success })
        }
      }
      cbs.push(check)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mock.simulateDisconnect = (peer: any) => {
    mock.callbacks['disconnect'].forEach((cb) => cb(peer))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mock as any
}
export const HTTPServerMock = () =>
  jest.createMockFromModule<HTTPServer>('http')
export const TCPServer = (): server.TCPServer & {
  simulateConnection: (peer: Peer) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  simulateDisconnect: (peer: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  simulateMessage: (peer: any, method: EventType, msg: MethodRequest) => any
} => {
  let cbs: { ({ id, message, success }): void }[] = []
  const mock = {
    ...(jest.createMockFromModule(
      '../../src/1_socket/tcpserver'
    ) as tcpserver.TCPServer),
    listen: () => {
      //do nothing
    },
    callbacks: {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    simulateConnection: (_peer: any) => {
      //do nothing
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    simulateDisconnect: (_peer: any) => {
      //do nothing
    },
    simulateMessage: (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      _peer: any,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      _method: EventType,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      _msg: MethodRequest
    ) => {
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
  }

  mock.simulateMessage = (peer, method: EventType, msg: MethodRequest) => {
    peer.callbacks['message'].forEach((cb) => cb(method, msg))
    return new Promise((resolve) => {
      const check = ({ id, message, success }) => {
        if (id === msg.id) {
          cbs = cbs.filter((cb) => cb !== check)
          resolve({ id: id, message: message, success: success })
        }
      }
      cbs.push(check)
    })
  }

  mock.simulateDisconnect = (peer) => {
    mock.callbacks['disconnect'].forEach((cb) => cb(peer))
  }
  return mock
}
