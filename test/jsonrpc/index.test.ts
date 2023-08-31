import * as Sock from '../../src/1_socket/socket'
import { sockMock } from '../mocks/sock'
import JsonRPC from '../../src/2_jsonrpc'
import { Logger } from '../../src/3_jet/log'
import { LogLevel } from '../../src/'
import waitForExpect from 'wait-for-expect'
import {
  ConnectionClosed,
  INVALID_PARAMS_CODE,
  methodNotFoundError
} from '../../src/jet'

describe('Testing JsonRpc', () => {
  it('Should test basic functionality', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    const jsonrpc = new JsonRPC(new Logger())
    jsonrpc
      .connect(new AbortController())
      .then(() => jsonrpc.connect(new AbortController()))
      .then(() => {
        jsonrpc.close().then(() => done())
        sock.emit('close')
      })
    sock.emit('open')
  })
  it('Should test abort ', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    const jsonrpc = new JsonRPC(new Logger())
    const abortControler = new AbortController()
    jsonrpc
      .connect(abortControler)
      .then(() => console.log('Connected'))
      .catch(() => done())
    abortControler.abort()
    sock.emit('open')
  })
  it('Should test disconnect ', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    const jsonrpc = new JsonRPC(new Logger())
    expect(() =>
      jsonrpc.sendRequest('add', { path: 'foo', value: 3 })
    ).rejects.toEqual(new ConnectionClosed())
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jsonrpc.queue({ event: 'Add', path: 'foo', value: 1 } as any, '__f__')
    ).rejects.toEqual(new ConnectionClosed())

    jsonrpc.close().then(() => done())
  })

  it('Should test send', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    jest.spyOn(sock, 'send').mockImplementation((msg) => {
      expect(msg).toEqual(
        JSON.stringify({
          id: '1',
          method: 'add',
          params: { path: 'foo', value: 3 }
        })
      )
      done()
    })
    const jsonrpc = new JsonRPC(new Logger(), {}, sock)
    jsonrpc.sendRequest('add', { path: 'foo', value: 3 })
  })
  it('Should test batch send', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    jest.spyOn(sock, 'send').mockImplementation((msg) => {
      expect(msg).toEqual(
        JSON.stringify([
          { id: '1', method: 'add', params: { path: 'foo', value: 3 } },
          { id: '2', method: 'add', params: { path: 'foo1', value: 4 } },
          { id: '3', method: 'add', params: { path: 'foo2', value: 5 } },
          { id: '4', method: 'add', params: { path: 'foo3', value: 6 } }
        ])
      )
      done()
    })
    const jsonrpc = new JsonRPC(new Logger(), { batches: true })
    jsonrpc.connect().then(() => {
      jsonrpc.sendImmediate = false
      jsonrpc.sendRequest('add', { path: 'foo', value: 3 })
      jsonrpc.sendRequest('add', { path: 'foo1', value: 4 })
      jsonrpc.sendRequest('add', { path: 'foo2', value: 5 })
      jsonrpc.sendRequest('add', { path: 'foo3', value: 6 })
      jsonrpc.send()
    })
    sock.emit('open')
  })

  it('Should test publish', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    jest.spyOn(sock, 'send').mockImplementation((msg) => {
      expect(msg).toEqual(
        JSON.stringify({
          method: '_f',
          params: { event: 'Add', path: 'foo', value: 1 }
        })
      )
      done()
    })
    const jsonrpc = new JsonRPC(new Logger())
    jsonrpc.connect().then(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jsonrpc.queue({ event: 'Add', path: 'foo', value: 1 } as any, '_f')
    )
    sock.emit('open')
  })
  it('Should test batch notify', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    jest.spyOn(sock, 'send').mockImplementation((msg) => {
      expect(
        JSON.stringify([
          {
            method: '_f',
            params: { event: 'Add', path: 'foo', value: 1 }
          },
          {
            method: '_f',
            params: { event: 'Add', path: 'foo', value: 2 }
          },
          {
            method: '_f',
            params: { event: 'Add', path: 'foo', value: 3 }
          }
        ])
      ).toContain(msg)
    })
    const jsonrpc = new JsonRPC(new Logger())
    jsonrpc
      .connect(new AbortController())
      .then(() => {
        jsonrpc.sendImmediate = false
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jsonrpc.queue({ event: 'Add', path: 'foo', value: 1 } as any, '_f')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jsonrpc.queue({ event: 'Add', path: 'foo', value: 2 } as any, '_f')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jsonrpc.queue({ event: 'Add', path: 'foo', value: 3 } as any, '_f')
        jsonrpc.send()
      })

      .then(() => waitForExpect(() => expect(sock.send).toBeCalledTimes(1)))
      .then(done())
    sock.emit('open')
  })
  it('Should test single batch notify', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    jest.spyOn(sock, 'send').mockImplementation((msg) => {
      expect(
        JSON.stringify([
          {
            method: '_f',
            params: { event: 'Add', path: 'foo', value: 1 }
          }
        ])
      ).toContain(msg)
    })
    const jsonrpc = new JsonRPC(new Logger())
    jsonrpc
      .connect(new AbortController())
      .then(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jsonrpc.queue({ event: 'Add', path: 'foo', value: 1 } as any, '_f')
      })

      .then(() => waitForExpect(() => expect(sock.send).toBeCalledTimes(1)))
      .then(done())
    sock.emit('open')
  })
  it('Should fail processing batch notify', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    jest.spyOn(sock, 'send').mockImplementation((msg) => {
      expect(
        '{"id":1,"error":{"code":-32600,"message":"Message could not be parsed","data":{"name":"jet.ParseError","url":"https://github.com/lipp/node-jet/blob/master/doc/peer.markdown#jetparseerror","details":"{\\"id\\":1}"},"name":"jet.ParseError"}}'
      ).toEqual(msg)
    })
    const jsonrpc = new JsonRPC(new Logger())
    jsonrpc
      .connect(new AbortController())
      .then(() => {
        sock.emit('message', {
          data: JSON.stringify({ id: 1 })
        })
      })

      .then(() => waitForExpect(() => expect(sock.send).toBeCalledTimes(1)))
      .then(() => done())
    sock.emit('open')
  })

  it('Should test invalid request', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    const logger = new Logger({
      logName: 'Mock',
      logLevel: LogLevel.error,
      logCallbacks: [
        (msg) => {
          console.log(msg)
          expect(msg).toContain('Mock	error	SyntaxError: Unexpected token')
          done()
        }
      ]
    })
    const jsonrpc = new JsonRPC(logger)
    jsonrpc.connect(new AbortController()).then(() => {
      const json = 'Invalid Json'
      sock.emit('message', { data: json })
    })
    sock.emit('open')
  })

  it('Should log socket errors', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    const logger = new Logger({
      logName: 'Mock',
      logLevel: LogLevel.error,
      logCallbacks: [
        (msg) => {
          console.log(msg)
          expect(msg).toContain(
            'Mock	error	Error in socket connection: sock error'
          )
          done()
        }
      ]
    })
    const jsonrpc = new JsonRPC(logger)
    jsonrpc
      .connect(new AbortController())
      .then(() => sock.emit('error', 'sock error'))
    sock.emit('open')
  })
  it('Should log socket errors while closed', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    const logger = new Logger({
      logName: 'Mock',
      logLevel: LogLevel.error,
      logCallbacks: [
        (msg) => {
          console.log(msg)
          expect(msg).toContain('Error in socket connection: sock error')
        }
      ]
    })
    const jsonrpc = new JsonRPC(logger)
    jsonrpc.connect(new AbortController()).catch(() => done())
    sock.emit('error', 'sock error')
  })
  it('Should test incoming request', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)

    const jsonrpc = new JsonRPC(new Logger())
    jsonrpc.connect(new AbortController()).then(() => {
      jsonrpc.addListener('add', (_peer, id, msg) => {
        expect(id).toEqual('1')
        expect(msg).toEqual({ event: 'Add', path: 'foo', value: 1 })
        done()
      })
      const json = JSON.stringify({
        id: '1',
        method: 'add',
        params: { event: 'Add', path: 'foo', value: 1 }
      })
      sock.emit('message', { data: json })
    })
    sock.emit('open')
  })
  it('Should test incoming request array', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    const msgMock = jest.fn()
    const messages = [
      {
        id: '1',
        method: 'add',
        params: { event: 'Add', path: 'foo', value: 1 }
      },
      {
        id: '3',
        method: 'add',
        params: { event: 'Add', path: 'foo', value: 1 }
      },
      {
        id: '4',
        method: 'add',
        params: { event: 'Add', path: 'foo', value: 1 }
      }
    ]
    const jsonrpc = new JsonRPC(new Logger())
    jsonrpc.addListener('add', () => msgMock())
    jsonrpc
      .connect(new AbortController())
      .then(() => {
        jsonrpc.addListener('add', (_peer, id, msg) => {
          expect(['1', '3', '4']).toContainEqual(id)
          expect(messages.map((msg) => msg.params)).toContainEqual(msg)
        })

        sock.emit('message', { data: JSON.stringify(messages) })
      })
      // .then(() => waitForExpect(() => expect(msgMock).toBeCalledTimes(3)))
      .then(() => done())
    sock.emit('open')
  })
  class MockDecoder {
    decode = () =>
      JSON.stringify({
        id: '1',
        method: 'add',
        params: { event: 'Add', path: 'foo', value: 1 }
      })
  }
  it('Should test incoming blob request', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)

    const jsonrpc = new JsonRPC(new Logger())
    jsonrpc.connect(new AbortController()).then(() => {
      jsonrpc.addListener('add', (_peer, id, msg) => {
        expect(id).toEqual('1')
        expect(msg).toEqual({ event: 'Add', path: 'foo', value: 1 })
        done()
      })
      const blob = new Blob([], {
        type: 'text/plain'
      })
      blob.arrayBuffer = () => Promise.resolve(new ArrayBuffer(10))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.TextDecoder = MockDecoder as any
      sock.emit('message', { data: blob })
    })
    sock.emit('open')
  })

  it('Should test incoming request', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)

    const jsonrpc = new JsonRPC(new Logger())
    jsonrpc.connect(new AbortController()).then(() => {
      jsonrpc.addListener('add', (_peer, id, msg) => {
        expect(id).toEqual('1')
        expect(msg).toEqual({ event: 'Add', path: 'foo', value: 1 })
        done()
      })
      const json = JSON.stringify({
        id: '1',
        method: 'add',
        params: { event: 'Add', path: 'foo', value: 1 }
      })
      sock.emit('message', { data: json })
    })
    sock.emit('open')
  })
  it('Should test invalid method', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)

    const msgMock = jest.fn().mockImplementation((msg) => {
      expect(msg).toEqual(
        JSON.stringify({
          id: '1',
          error: new methodNotFoundError('foo')
        })
      )
      done()
    })
    sock.send = msgMock
    const message = {
      id: '1',
      method: 'foo',
      params: { event: 'Add', path: 'foo', value: 1 }
    }
    const jsonrpc = new JsonRPC(new Logger())
    jsonrpc.connect(new AbortController()).then(() => {
      sock.emit('message', { data: JSON.stringify(message) })
    })

    sock.emit('open')
  })
  it('Should respond', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    jest.spyOn(sock, 'send').mockImplementation((msg) => {
      expect(msg).toEqual(JSON.stringify({ id: 'id', result: {} }))
      done()
    })
    const jsonrpc = new JsonRPC(new Logger())
    jsonrpc.connect().then(() => jsonrpc.respond('id', {}, true))
    sock.emit('open')
  })
  it('Should respond error', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    jest.spyOn(sock, 'send').mockImplementation((msg) => {
      expect(msg).toEqual(JSON.stringify({ id: 'id', error: {} }))
      done()
    })
    const jsonrpc = new JsonRPC(new Logger())
    jsonrpc.connect().then(() => jsonrpc.respond('id', {}, false))
    sock.emit('open')
  })
  it('Should test result response', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)

    const jsonrpc = new JsonRPC(new Logger())
    jsonrpc.connect().then(() => {
      jsonrpc.sendRequest('add', { path: 'foo' }).then((res) => {
        expect(res).toEqual('this is my result')
        done()
      })
      const json = JSON.stringify({ id: '1', result: 'this is my result' })
      sock.emit('message', { data: json })
    })
    sock.emit('open')
  })

  it('Should test error response', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)

    const jsonrpc = new JsonRPC(new Logger())
    jsonrpc.connect().then(() => {
      jsonrpc.sendRequest('add', { path: 'foo' }).catch((res) => {
        expect(res).toEqual('this is my error')
        done()
      })
      const json = JSON.stringify({ id: '1', error: 'this is my error' })
      sock.emit('message', { data: json })
    })
    sock.emit('open')
  })

  it('Should test error object response', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    const json = JSON.stringify({
      id: '1',
      error: { code: INVALID_PARAMS_CODE, data: { pathNotExists: 'Foo' } }
    })
    const jsonrpc = new JsonRPC(new Logger())
    jsonrpc.connect().then(() => {
      sock.emit('message', { data: json })
      expect(jsonrpc.sendRequest('add', { path: 'foo' }, true)).rejects.toEqual(
        {
          code: -32602,
          data: {
            pathNotExists: 'Foo'
          }
        }
      )
      done()
    })

    sock.emit('open')
  })
  it('Should test batch response', (done) => {
    const sock = sockMock()

    const json = JSON.stringify([
      {
        id: '1',
        result: {}
      },
      {
        id: '2',
        error: { code: 0, name: 'error' }
      }
    ])
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)
    jest.spyOn(sock, 'send').mockImplementationOnce((msg) => {
      expect(msg).toEqual(
        JSON.stringify([
          { id: '1', method: 'add', params: { path: 'foo', value: 3 } },
          { id: '2', method: 'add', params: { path: 'foo1', value: 4 } }
        ])
      )
      sock.emit('message', { data: json })
    })
    const jsonrpc = new JsonRPC(new Logger(), { batches: true })
    jsonrpc.connect().then(async () => {
      jsonrpc.sendImmediate = false
      jsonrpc.sendRequest('add', { path: 'foo', value: 3 })
      jsonrpc.sendRequest('add', { path: 'foo1', value: 4 })
      await waitForExpect(() =>
        expect(() => jsonrpc.send()).rejects.toEqual({
          code: 0,
          name: 'error'
        })
      )
      done()
    })

    sock.emit('open')
  })

  it('Should test batch invalid method', (done) => {
    const sock = sockMock()
    jest.spyOn(Sock, 'Socket').mockImplementation(() => sock)

    const msgMock = jest.fn().mockImplementation((msg) => {
      expect(msg).toEqual(
        JSON.stringify({
          id: '1',
          error: new methodNotFoundError('foo')
        })
      )
      done()
    })
    sock.send = msgMock
    const message = [
      {
        id: '1',
        method: 'foo',
        params: { event: 'Add', path: 'foo', value: 1 }
      }
    ]
    const jsonrpc = new JsonRPC(new Logger(), { batches: true })
    jsonrpc.connect(new AbortController()).then(() => {
      sock.emit('message', { data: JSON.stringify(message) })
    })

    sock.emit('open')
  })
})
