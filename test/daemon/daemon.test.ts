import { Peer } from '../../src/3_jet/peer'
import * as Server from '../../src/2_jsonrpc/server'
import Method from '../../src/3_jet/peer/method'
import State from '../../src/3_jet/peer/state'
import { ValueType } from '../../src/3_jet/types'
import waitForExpect from 'wait-for-expect'
import {
  ConnectionInUse,
  Daemon,
  Fetcher,
  InfoOptions,
  InvalidArgument,
  notAllowed,
  NotFound,
  Occupied
} from '../../src/jet'
import { jsonRPCServer } from '../mocks/jsonrpc'
import { AddRequest, MethodRequest } from '../../src/3_jet/messages'
import { fullFetcherPeer, simpleFecherPeer } from '../mocks/peer'
import {
  AddMethod,
  AddResolve,
  AddState,
  CallRequest,
  changeState,
  configure,
  fetchRequest,
  getRequest,
  info,
  RemoveRequest,
  RemoveResolve,
  SetRequest,
  unfetchRequest
} from '../mocks/messages'

const fullDaemon: InfoOptions = {
  features: {
    batches: true,
    asNotification: true,
    fetch: 'full'
  }
}
const simpleDaemon: InfoOptions = {
  features: {
    batches: true,
    asNotification: true,
    fetch: 'simple'
  }
}
describe('Testing Daemon 2 (Notifications)', () => {
  let mockServer
  beforeEach(() => {
    mockServer = jsonRPCServer()
    jest.spyOn(Server, 'JsonRPCServer').mockImplementation(() => mockServer)
  })
  it('should test info', (done) => {
    const daemon = new Daemon(fullDaemon)
    daemon.listen({})
    const peer = simpleFecherPeer()
    mockServer
      .simulateConnection(peer)
      .then(() => mockServer.message(peer, info()))
      .then((res) => {
        expect(res.message).toEqual({
          features: {
            asNotification: true,
            batches: true,
            fetch: 'full'
          },
          name: 'node-jet',
          protocolVersion: '1.1.0',
          version: '2.2.0'
        })
        expect(res.success).toEqual(true)
      })
      .then(() => mockServer.simulateDisconnect(peer))
      .then(() => daemon.close())
      .then(() => done())
  })
  it('should test configure', (done) => {
    const daemon = new Daemon()
    daemon.listen({})
    const peer = simpleFecherPeer()
    mockServer
      .simulateConnection(peer)
      .then(() => mockServer.message(peer, configure({})))
      .then((res) => {
        expect(res.message).toEqual({})
        expect(res.success).toEqual(true)
      })
      .then(() => mockServer.simulateDisconnect(peer))
      .then(() => done())
  })

  it('Should test add functionality', (done) => {
    const mockServer = jsonRPCServer()
    jest.spyOn(Server, 'JsonRPCServer').mockImplementation(() => mockServer)
    const daemon = new Daemon()
    daemon.listen({})
    const peer = simpleFecherPeer()
    mockServer
      .simulateConnection(peer)
      .then(() => mockServer.message(peer, AddState('bar', 1)))
      .then((res) => {
        expect(res).toEqual(AddResolve())
      })
      //Checks occupied error in case of same path
      .then(() => mockServer.message(peer, AddState('bar', 1)))
      .then((res) => {
        expect(res.message).toEqual(new Occupied())
        expect(res.success).toEqual(false)
      })
      //checks adding state with active matching fetch request
      .then(() =>
        mockServer.message(peer, fetchRequest({ startsWith: 'bar' }, '_f_1'))
      )
      .then((res) => {
        expect(res.success).toEqual(true)
      })
      .then(() => mockServer.message(peer, AddState('bar2', 1)))
      .then((res) => {
        expect(res).toEqual(AddResolve())
      })
      .then(() => mockServer.message(peer, AddMethod('method')))
      .then((res) => {
        expect(res).toEqual(AddResolve())
      })
      .then(() => mockServer.message(peer, AddMethod('method')))
      .then((res) => {
        expect(res.message).toEqual(new Occupied())
        expect(res.success).toEqual(false)
      })
      .then(() => mockServer.simulateDisconnect(peer))
      .then(() => done())
  })
  it('Should test remove functionality', (done) => {
    const peer = simpleFecherPeer()
    const mockServer = jsonRPCServer()
    jest.spyOn(Server, 'JsonRPCServer').mockImplementation(() => mockServer)
    const daemon = new Daemon()
    daemon.listen({})
    mockServer.simulateConnection(peer)
    mockServer
      .message(peer, RemoveRequest('bar'))
      .then((res) => {
        expect(res.success).toEqual(false)
        expect(res.message).toEqual(new NotFound())
      })
      .then(() => mockServer.message(peer, AddState('bar', 1)))
      .then((res) => {
        expect(res).toEqual(AddResolve())
      })
      .then(() => mockServer.message(peer, AddMethod('method')))
      .then((res) => {
        expect(res).toEqual(AddResolve())
      })
      .then(() => mockServer.message(peer, RemoveRequest('bar')))
      .then((res) => {
        expect(res).toEqual(RemoveResolve())
      })
      .then(() => mockServer.message(peer, RemoveRequest('method')))
      .then((res) => {
        expect(res).toEqual(RemoveResolve())
      })
      .then(() => mockServer.simulateDisconnect(peer))
      .then(() => done())
  })
  it('Should test full fetch functionality on simple fetch Daemon', (done) => {
    const mockServer = jsonRPCServer()
    jest.spyOn(Server, 'JsonRPCServer').mockImplementation(() => mockServer)
    const peer = fullFetcherPeer()
    const daemon = new Daemon(simpleDaemon)
    daemon.listen({})
    //Adding state
    mockServer
      .simulateConnection(peer)
      .then(() =>
        mockServer.message(peer, fetchRequest({ startsWith: 'bar' }, '__f__1'))
      )
      .then((res) => {
        expect(res.success).toBe(true)
      })
      .then(() =>
        mockServer.message(peer, fetchRequest({ startsWith: 'b' }, '__f__2'))
      )
      .then((res) => {
        expect(res.success).toBe(false)
        expect(res.message).toEqual(new ConnectionInUse())
      })
      .then(() => done())
  })
  it('Should test duplex full fetch functionality', (done) => {
    const mockServer = jsonRPCServer()
    jest.spyOn(Server, 'JsonRPCServer').mockImplementation(() => mockServer)
    const peer = fullFetcherPeer()
    const daemon = new Daemon(fullDaemon)
    daemon.listen({})
    //Adding state
    mockServer
      .simulateConnection(peer)
      .then(() =>
        mockServer.message(peer, fetchRequest({ startsWith: 'bar' }, '__f__1'))
      )
      .then((res) => {
        expect(res.success).toBe(true)
      })
      .then(() =>
        mockServer.message(peer, fetchRequest({ startswith: 'b' }, '__f__2'))
      )
      .then((res) => {
        expect(res.success).toBe(false)
        expect(res.message).toEqual(new InvalidArgument())
      })
      .then(() => done())
  })
  it('Should test fetch functionality', (done) => {
    const mockServer = jsonRPCServer()
    jest.spyOn(Server, 'JsonRPCServer').mockImplementation(() => mockServer)
    const peer = simpleFecherPeer()

    const daemon = new Daemon(fullDaemon)
    daemon.listen({})
    mockServer
      .simulateConnection(peer)
      .then(() => mockServer.message(peer, AddState('bar', 2)))
      .then(() => mockServer.message(peer, AddState('bar2', 3)))
      .then(() => mockServer.message(peer, AddState('bar4', 5)))
      .then(() => mockServer.message(peer, changeState('bar', 1)))
      .then(() => mockServer.message(peer, changeState('bar4', 6)))
      .then(() =>
        mockServer.message(peer, fetchRequest({ startsWith: 'bar' }, '__f__1'))
      )
      .then((res) => {
        expect(peer.queue).toBeCalledTimes(3)
        expect(res.message).toEqual({})
        expect(res.success).toEqual(true)
      })
      .then(() =>
        mockServer.message(peer, fetchRequest({ startsWith: 'bar' }, '__f__1'))
      )
      .then((res) => {
        expect(res.message).toEqual(new Occupied())
        expect(res.success).toEqual(false)
      })
      .then(() => done())
  })
  it('Should test unfetch functionality', (done) => {
    const mockServer = jsonRPCServer()
    jest.spyOn(Server, 'JsonRPCServer').mockImplementation(() => mockServer)
    const peer = simpleFecherPeer()
    const peer2 = simpleFecherPeer()

    const daemon = new Daemon(fullDaemon)
    daemon.listen({})
    mockServer
      .simulateConnection(peer)
      .then(() => mockServer.simulateConnection(peer2))
      .then(() => mockServer.message(peer, AddState('bar', 2)))
      .then(() =>
        mockServer.message(peer, fetchRequest({ startsWith: 'bar' }, '__f__1'))
      )
      .then((res) => expect(res.success).toEqual(true))
      .then(() =>
        mockServer.message(peer2, fetchRequest({ startsWith: 'bar' }, '__f__2'))
      )
      .then((res) => {
        expect(peer.queue).toBeCalledTimes(1)
        expect(res.message).toEqual({})
        expect(res.success).toEqual(true)
      })
      .then(() => mockServer.message(peer, unfetchRequest('__f__3')))
      .then((res) => {
        expect(res.message).toEqual(new NotFound())
        expect(res.success).toEqual(false)
      })
      .then(() => mockServer.message(peer, unfetchRequest('__f__2')))
      .then((res) => {
        expect(res.message).toEqual(new notAllowed())
        expect(res.success).toEqual(false)
      })
      .then(() => mockServer.message(peer, unfetchRequest('__f__1')))
      .then((res) => {
        expect(res.message).toEqual({})
        expect(res.success).toEqual(true)
      })
      .then(() =>
        mockServer.message(peer2, fetchRequest({ startsWith: 'bar' }, '__f__2'))
      )
      .then(() => mockServer.simulateDisconnect(peer))
      .then(() => done())
  })

  it('Should test change functionality', (done) => {
    const mockServer = jsonRPCServer()
    jest.spyOn(Server, 'JsonRPCServer').mockImplementation(() => mockServer)
    const daemon = new Daemon(fullDaemon)
    daemon.listen()
    const newValue = 6
    const peer = simpleFecherPeer()
    mockServer
      .simulateConnection(peer)
      .then(() => mockServer.message(peer, AddState('bar', 2)))
      .then(() =>
        mockServer.message(peer, fetchRequest({ startsWith: 'bar' }, 'f_1'))
      )
      .then((res) => expect(res.success).toEqual(true))
      .then(() => mockServer.message(peer, changeState('bar', newValue)))
      .then((res) => expect(res.success).toEqual(true))
      .then(() => mockServer.message(peer, changeState('bar', newValue)))
      .then((res) => expect(res.success).toEqual(true))
      .then(() => mockServer.message(peer, changeState('bar2', newValue)))
      .then((res) => {
        expect(res.message).toEqual(new NotFound())
        expect(res.success).toEqual(false)
      })
      .then(() => mockServer.simulateDisconnect(peer))
      .then(() => done())
  })
  it('Should test set', (done) => {
    const mockServer = jsonRPCServer()
    jest.spyOn(Server, 'JsonRPCServer').mockImplementation(() => mockServer)
    const daemon = new Daemon(fullDaemon)
    daemon.listen({})
    const newValue = 6
    const peer = simpleFecherPeer()
    mockServer
      .simulateConnection(peer)
      .then(() => mockServer.message(peer, AddState('bar', 2)))
      .then((res) => expect(res.success).toEqual(true))
      .then(() => mockServer.message(peer, SetRequest('bar', newValue)))
      .then((res) => expect(res.success).toEqual(true))
      .then(() => mockServer.message(peer, SetRequest('bar2', newValue)))
      .then((res) => {
        expect(res.message).toEqual(new NotFound())
        expect(res.success).toEqual(false)
      })
      .then(() => mockServer.simulateDisconnect(peer))
      .then(() => done())
  })
  it('Should test call', (done) => {
    const mockServer = jsonRPCServer()
    jest.spyOn(Server, 'JsonRPCServer').mockImplementation(() => mockServer)
    const daemon = new Daemon(fullDaemon)
    daemon.listen({})
    const peer = simpleFecherPeer()
    mockServer
      .simulateConnection(peer)
      .then(() => mockServer.message(peer, AddMethod('bar')))
      .then((res) => expect(res.success).toEqual(true))
      .then(() => mockServer.message(peer, CallRequest('bar', [4])))
      .then((res) => expect(res.success).toEqual(true))
      .then(() => mockServer.message(peer, CallRequest('bar2', [4])))
      .then((res) => {
        expect(res.message).toEqual(new NotFound())
        expect(res.success).toEqual(false)
      })
      .then(() => mockServer.simulateDisconnect(peer))
      .then(() => done())
  })

  it('Should test get functionality', (done) => {
    const mockServer = jsonRPCServer()
    jest.spyOn(Server, 'JsonRPCServer').mockImplementation(() => mockServer)
    const daemon = new Daemon(fullDaemon)
    daemon.listen({})
    const fetchId = '__f__1'
    const newValue = 6
    const peer = simpleFecherPeer()
    peer.queue = jest.fn()

    //Adding state
    mockServer
      .simulateConnection(peer)
      .then(() => mockServer.message(peer, AddState('bar', 0)))
      .then(() => mockServer.message(peer, AddState('bar1', 1)))
      .then(() => mockServer.message(peer, AddState('bar11', 2)))
      .then(() => mockServer.message(peer, AddState('bar111', 3)))
      .then(() => mockServer.message(peer, getRequest({ startsWith: 'bar' })))
      .then((res) => {
        expect(res.success).toEqual(true)
        expect(res.message).toEqual([
          { path: 'bar', value: 0 },
          { path: 'bar1', value: 1 },
          { path: 'bar11', value: 2 },
          { path: 'bar111', value: 3 }
        ])
      })
      .then(() => mockServer.message(peer, getRequest({ endsWith: 'bar' })))
      .then((res) => {
        expect(res.success).toEqual(true)
        expect(res.message).toEqual([{ path: 'bar', value: 0 }])
      })

      .then(() => mockServer.simulateDisconnect(peer))
      .then(() => done())
  })
})
