import { Peer } from '../../src/3_jet/peer'
import * as JsonRPC from '../../src/2_jsonrpc/index'
import Method from '../../src/3_jet/peer/method'
import State from '../../src/3_jet/peer/state'
import { ValueType } from '../../src/3_jet/types'
import { Fetcher, invalidMethod, NotFound } from '../../src/jet'
import { fullFetcherPeer, simpleFecherPeer } from '../mocks/peer'
import { fetchSimpleId } from '../../src/3_jet/types'
import waitForExpect from 'wait-for-expect'
import { InvalidParamError } from '../../src/jet'
describe('Testing Peer', () => {
  describe('Should handle daemon messages', () => {
    describe('Should send different messages full fetch', () => {
      const cbs = {}
      let jsonRpc
      let peer
      beforeEach(async () => {
        jsonRpc = fullFetcherPeer()
        jsonRpc.addListener = jest
          .fn()
          .mockImplementation((eventName, callback) => {
            cbs[eventName] = callback
            return jsonRpc
          })
        jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonRpc)
        peer = new Peer()
        await peer.connect()
      })
      afterEach(() => peer.close())
      it('should test get', (done) => {
        const s = new State<ValueType>('foo', 5)
        peer.add(s).then(() => {
          const par = { path: 'foo', value: 5 }
          cbs['get'](undefined, 'fooId', { path: 'foo' })
          expect(jsonRpc.respond).toBeCalledWith('fooId', par, true)
          done()
        })
      })
      it('should fail get', () => {
        cbs['get'](undefined, 'fooId', { path: 'foo' })
        expect(jsonRpc.respond).toBeCalledWith('fooId', new NotFound(), false)
      })
      it('should fail to get a method', (done) => {
        const m = new Method('foo')
        peer
          .add(m)
          .then(() => cbs['get'](undefined, 'fooId', { path: 'foo' }))
          .then(() =>
            waitForExpect(() =>
              expect(jsonRpc.respond).toBeCalledWith(
                'fooId',
                new invalidMethod(),
                false
              )
            )
          )
          .then(() => done())
      })
      it('should test set', (done) => {
        const s = new State<ValueType>('foo', 5)
        peer.add(s).then(() => {
          const par = { path: 'foo', value: 5 }
          cbs['set'](undefined, 'fooId', par)
          expect(s._value).toEqual(5)
          expect(jsonRpc.respond).toBeCalledWith('fooId', par, true)
          done()
        })
      })
      it('should fail set with thrown string', (done) => {
        const s = new State<ValueType>('foo', 5)
        s.on('set', () => {
          throw 'test'
        })
        peer.add(s).then(() => {
          const par = { path: 'foo', value: 5 }
          cbs['set'](undefined, 'fooId', par)
          expect(s._value).toEqual(5)
          expect(jsonRpc.respond).toBeCalledWith(
            'fooId',
            new InvalidParamError('InvalidParam', 'Failed to set value'),
            false
          )
          done()
        })
      })
      it('should fail call with thrown string', (done) => {
        const s = new Method('foo')
        s.on('call', () => {
          throw 'test'
        })
        peer.add(s).then(() => {
          const par = { path: 'foo', value: 5 }
          cbs['call'](undefined, 'fooId', par)

          expect(jsonRpc.respond).toBeCalledWith(
            'fooId',
            new InvalidParamError('InvalidParam', 'Failed to call method'),
            false
          )
          done()
        })
      })
      it('should fail call with thrown object', (done) => {
        const s = new Method('foo')
        s.on('call', () => {
          throw { test: 4 }
        })
        peer.add(s).then(() => {
          const par = { path: 'foo', value: 5 }
          cbs['call'](undefined, 'fooId', par)

          expect(jsonRpc.respond).toBeCalledWith(
            'fooId',
            new InvalidParamError(
              'InvalidParam',
              'Failed to call method',
              'details'
            ),
            false
          )
          done()
        })
      })
      it('should fail set with error', (done) => {
        const s = new State<ValueType>('foo', 5)
        s.on('set', () => {
          throw Error()
        })
        peer.add(s).then(() => {
          const par = { path: 'foo', value: 5 }
          cbs['set'](undefined, 'fooId', par)
          expect(s._value).toEqual(5)
          expect(jsonRpc.respond).toBeCalledWith(
            'fooId',
            new InvalidParamError('InvalidParam', 'Failed to set value'),
            false
          )
          done()
        })
      })
      it('should fail set', () => {
        cbs['set'](undefined, 'fooId', { path: 'foo' })
        expect(jsonRpc.respond).toBeCalledWith('fooId', new NotFound(), false)
      })
      it('should fail to set a method', (done) => {
        const m = new Method('foo')

        peer
          .add(m)
          .then(() => cbs['set'](undefined, 'fooId', { path: 'foo' }))
          .then(() =>
            waitForExpect(() =>
              expect(jsonRpc.respond).toBeCalledWith(
                'fooId',
                new invalidMethod(),
                false
              )
            )
          )
          .then(() => done())
      })

      it('should test call', (done) => {
        const m = new Method('bar')
        const callSpy = jest.spyOn(m, 'call').mockImplementation((args) => {
          expect(args).toEqual(['a', 'b'])
        })
        peer.add(m).then(() => {
          const par = { path: 'bar', args: ['a', 'b'] }
          cbs['call'](undefined, 'fooId3', par)
          expect(callSpy).toBeCalledTimes(1)
          expect(jsonRpc.respond).toBeCalledWith('fooId3', {}, true)
          done()
        })
      })
      it('should fail call', () => {
        cbs['call'](undefined, 'fooId', { path: 'foo' })
        expect(jsonRpc.respond).toBeCalledWith('fooId', new NotFound(), false)
      })
      it('should fail to set a method', (done) => {
        const m = new State('foo', 5)
        peer
          .add(m)
          .then(() => cbs['call'](undefined, 'fooId', { path: 'foo' }))
          .then(() =>
            waitForExpect(() =>
              expect(jsonRpc.respond).toBeCalledWith(
                'fooId',
                new invalidMethod(),
                false
              )
            )
          )
          .then(() => done())
      })
      it('should test fetch', (done) => {
        const m = new Fetcher().path('equals', 'foo')
        const fetchSpy = jest
          .spyOn(m, 'emit')
          .mockImplementation((event, args) => {
            expect(event).toEqual('data')
            expect(args).toEqual({ params: { path: 'foo' } })
            return true
          })
        peer.fetch(m).then(() => {
          Object.keys(cbs).forEach((key) => {
            if (!['call', 'fetch_all', 'get', 'set'].includes(key)) {
              cbs[key](undefined, 'fooId3', { params: { path: 'foo' } })
            }
          })

          expect(fetchSpy).toBeCalledTimes(1)
          done()
        })
      })
    })
    describe('Should send different messages simple fetch', () => {
      const cbs = {}
      let jsonRpc
      let peer
      beforeEach(async () => {
        jsonRpc = simpleFecherPeer()
        jsonRpc.addListener = jest
          .fn()
          .mockImplementation((eventName, callback) => {
            cbs[eventName] = callback
            return jsonRpc
          })
        jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonRpc)
        peer = new Peer()
        await peer.connect()
      })
      // afterEach(() => peer.close());
      it('should test fetch', (done) => {
        const m = new Fetcher().path('equals', 'foo')
        const fetchSpy = jest
          .spyOn(m, 'emit')
          .mockImplementation((event, args) => {
            expect(event).toEqual('data')
            expect(args).toEqual({ path: 'foo', value: 4 })
            return true
          })
        peer.fetch(m).then(() => {
          cbs['fetch_all'](undefined, 'fooId3', { path: 'foo', value: 4 })
          expect(fetchSpy).toBeCalledTimes(1)
          done()
        })
      })
    })
  })
  describe('Should connect to daemon', () => {
    it('Should fail to connect', (done) => {
      const connectSpy = jest
        .fn()
        .mockReturnValue(Promise.reject('could not connect'))
      const jsonrpc = { ...fullFetcherPeer(), connect: connectSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.connect().catch((ex) => {
        expect(connectSpy).toBeCalled()
        expect(ex).toBe('could not connect')
        done()
      })
    })

    it('Should connect to peer', (done) => {
      const connectSpy = jest.fn().mockReturnValue(Promise.resolve())
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve())
      const jsonrpc = {
        ...fullFetcherPeer(),
        connect: connectSpy,
        sendRequest: sendSpy
      }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.connect().then(() => {
        expect(connectSpy).toBeCalled()
        expect(sendSpy).toBeCalledWith('info', {}, true)
        expect(peer.isConnected()).toBe(true)
        done()
      })
    })
  })

  describe('Should test add methods', () => {
    it('Should fail to add a state', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.reject('invalid path'))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.add(new State<ValueType>('My path', 3)).catch((ex) => {
        expect(sendSpy).toBeCalledWith(
          'add',
          { path: 'My path', value: 3 },
          true
        )
        expect(ex).toBe('invalid path')
        done()
      })
    })
    it('Should add a state and change the value', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      const myState = new State<ValueType>('My path', 4)
      peer.add(myState).then(() => {
        expect(sendSpy).toBeCalledWith(
          'add',
          { path: 'My path', value: 4 },
          true
        )
        myState.value(6)
        expect(sendSpy).toBeCalledWith(
          'change',
          { path: 'My path', value: 6 },
          true
        )
        done()
      })
    })
    it('Should add a method', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.add(new Method('My path')).then(() => {
        expect(sendSpy).toBeCalledWith('add', { path: 'My path' }, true)
        done()
      })
    })
    it('Should add a method', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.add(new Method('My path')).then(() => {
        expect(sendSpy).toBeCalledWith('add', { path: 'My path' }, true)
        done()
      })
    })
    it('Should create batch', () => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.batch(() => jest.fn())
    })
    it('Should fail to create  batch', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}))
      const connSpy = jest
        .fn()
        .mockReturnValue(Promise.resolve({ features: { batches: false } }))
      const jsonrpc = {
        ...fullFetcherPeer(),
        sendRequest: sendSpy,
        connect: connSpy
      }

      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.connect().then(() => {
        expect(() => peer.batch(() => jest.fn())).toThrow('')
        done()
      })
    })
    it('Should send configure', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.configure({}).then(() => {
        expect(sendSpy).toBeCalledWith('config', {}, true)
        done()
      })
    })
  })
  describe('Should test removing a state', () => {
    it('Should fail to remove a state', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.reject('invalid path'))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.remove(new State<ValueType>('My path', 5)).catch((ex) => {
        expect(sendSpy).toBeCalledWith('remove', { path: 'My path' }, true)
        expect(ex).toBe('invalid path')
        done()
      })
    })
    it('Should remove a state', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.remove(new State<ValueType>('My path', 5)).then(() => {
        expect(sendSpy).toBeCalledWith('remove', { path: 'My path' }, true)
        done()
      })
    })
  })
  it('Should add a State', (done) => {
    const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}))
    const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
    jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
    const peer = new Peer()
    peer.addUser('Admin', 'admin', ['test']).then(() => {
      expect(sendSpy).toBeCalledWith(
        'addUser',
        {
          password: 'admin',
          user: 'Admin',
          groups: ['test']
        },
        true
      )
      done()
    })
  })
  it('Should authenticate', (done) => {
    const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}))
    const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
    jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
    const peer = new Peer()
    peer.authenticate('Admin', 'admin').then(() => {
      expect(sendSpy).toBeCalledWith(
        'authenticate',
        {
          password: 'admin',
          user: 'Admin'
        },
        true
      )
      done()
    })
  })
  describe('Should test getting a state', () => {
    it('Should fail to get a state', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.reject('invalid path'))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.get({ path: { startsWith: 'a' } }).catch((ex) => {
        expect(sendSpy).toBeCalledWith(
          'get',
          { path: { startsWith: 'a' } },
          true
        )
        expect(ex).toBe('invalid path')
        done()
      })
    })
    it('Should get a state', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve(5))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.get({ path: { startsWith: 'a' } }).then((res) => {
        expect(sendSpy).toBeCalledWith(
          'get',
          { path: { startsWith: 'a' } },
          true
        )
        expect(res).toBe(5)
        done()
      })
    })
  })

  describe('Should test setting a state', () => {
    it('Should fail to set a state', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.reject('invalid path'))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.set('Foo', 5).catch((ex) => {
        expect(sendSpy).toBeCalledWith(
          'set',
          {
            path: 'Foo',
            value: 5
          },
          true
        )
        expect(ex).toBe('invalid path')
        done()
      })
    })
    it('Should set a state', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve(5))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.set('Foo', 5).then((res) => {
        expect(sendSpy).toBeCalledWith('set', { path: 'Foo', value: 5 }, true)
        expect(res).toBe(5)
        done()
      })
    })
  })
  describe('Should test calling a method', () => {
    it('Should fail to call a method', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.reject('invalid path'))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.call('Foo', [5]).catch((ex) => {
        expect(sendSpy).toBeCalledWith(
          'call',
          {
            path: 'Foo',
            args: [5]
          },
          true
        )
        expect(ex).toBe('invalid path')
        done()
      })
    })
    it('Should call a method', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.call('Foo', { abc: 4 }).then((res) => {
        expect(sendSpy).toBeCalledWith(
          'call',
          {
            path: 'Foo',
            args: { abc: 4 }
          },
          true
        )
        expect(res).toEqual({})
        done()
      })
    })
  })
  describe('Should test calling a method', () => {
    it('Should fail to call a method', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.reject('invalid path'))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.call('Foo', [5]).catch((ex) => {
        expect(sendSpy).toBeCalledWith(
          'call',
          {
            path: 'Foo',
            args: [5]
          },
          true
        )
        expect(ex).toBe('invalid path')
        done()
      })
    })
    it('Should call a method', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.call('Foo', { abc: 4 }).then((res) => {
        expect(sendSpy).toBeCalledWith(
          'call',
          {
            path: 'Foo',
            args: { abc: 4 }
          },
          true
        )
        expect(res).toEqual({})
        done()
      })
    })
  })
  describe('Should test fetching', () => {
    it('Should fail to fetch', (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.reject('invalid path'))
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer.fetch(new Fetcher()).catch((ex) => {
        expect(sendSpy).toBeCalledWith(
          'fetch',
          expect.objectContaining({}),
          true
        )
        expect(ex).toBe('invalid path')
        done()
      })
    })
    it('Should fetch', (done) => {
      const sendSpy = jest
        .fn()
        .mockImplementation((method) =>
          method === 'info'
            ? Promise.resolve({ features: { fetch: 'full' } })
            : Promise.resolve()
        )
      const jsonrpc = { ...fullFetcherPeer(), sendRequest: sendSpy }
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => jsonrpc)
      const peer = new Peer()
      peer
        .connect()
        .then(() => peer.fetch(new Fetcher().path('startsWith', 'a')))
        .then(() => {
          expect(sendSpy).toBeCalledWith(
            'fetch',
            expect.objectContaining({
              path: { startsWith: 'a' }
            }),
            true
          )
        })
        .then(() => peer.fetch(new Fetcher().path('equals', 'b')))
        .then(() => {
          expect(sendSpy).toBeCalledWith(
            'fetch',
            expect.objectContaining({
              path: { equals: 'b' }
            }),
            true
          )

          done()
        })
    })
    it('Should simple fetch', (done) => {
      const cbs = {}
      const mockPeer = simpleFecherPeer()
      mockPeer.addListener = jest
        .fn()
        .mockImplementation((eventName, callback) => {
          cbs[eventName] = callback
          return mockPeer
        })
      jest.spyOn(JsonRPC, 'default').mockImplementation(() => mockPeer)
      const peer = new Peer()
      peer
        .connect()
        .then(() =>
          cbs[fetchSimpleId](mockPeer, 'id', {
            path: 'foo',
            event: 'add',
            value: 5
          })
        )
        .then(() => peer.fetch(new Fetcher().path('startsWith', 'f')))
        .then(() => {
          expect(mockPeer.sendRequest).toBeCalledWith(
            'fetch',
            {
              id: 'fetch_all',
              path: { startsWith: '' }
            },
            true
          )
        })
        .then(() => peer.fetch(new Fetcher().path('equals', 'b')))
        .then(() => {
          expect(mockPeer.sendRequest).toBeCalledTimes(2)
          done()
        })
    })
  })
  describe('Should test unfetching', () => {
    it('Should fail to unfetch', (done) => {
      jest.spyOn(JsonRPC, 'default').mockReturnValue(fullFetcherPeer())
      const peer = new Peer()
      peer.unfetch(new Fetcher()).catch((ex) => {
        expect(ex).toBe('Could not find fetcher')
        done()
      })
    })
    it('Should unfetch full', (done) => {
      const sendSpy = jest
        .fn()
        .mockImplementation((method) =>
          method === 'info'
            ? Promise.resolve({ features: { fetch: 'full' } })
            : Promise.resolve([])
        )

      jest
        .spyOn(JsonRPC, 'default')
        .mockReturnValue({ ...fullFetcherPeer(), sendRequest: sendSpy })
      const peer = new Peer()
      const fetcher = new Fetcher()
      peer
        .connect()
        .then(() => peer.fetch(fetcher))
        .then(() => peer.unfetch(fetcher))
        .then(() => {
          expect(sendSpy).toBeCalledWith('unfetch', expect.anything(), true)
          done()
        })
    })

    it('Should unfetch simple', (done) => {
      const sendSpy = jest
        .fn()
        .mockImplementation((method) =>
          method === 'info'
            ? Promise.resolve({ features: { fetch: 'simple' } })
            : Promise.resolve([])
        )
      jest
        .spyOn(JsonRPC, 'default')
        .mockReturnValue({ ...simpleFecherPeer(), sendRequest: sendSpy })
      const peer = new Peer()
      const fetcher = new Fetcher()
      const f2 = new Fetcher()
      peer
        .connect()
        .then(() => expect(sendSpy).toBeCalledTimes(1))
        .then(() => peer.fetch(fetcher))
        .then(() => expect(sendSpy).toBeCalledTimes(2))
        .then(() => peer.fetch(f2))
        .then(() => expect(sendSpy).toBeCalledTimes(2))
        .then(() => peer.unfetch(fetcher))
        .then(() => expect(sendSpy).toBeCalledTimes(2))
        .then(() => peer.unfetch(f2))
        .then(() => {
          //Only send unfetch event when no fetchers are registered anymore
          expect(sendSpy).toBeCalledTimes(3)
          expect(sendSpy).toBeCalledWith('unfetch', { id: 'fetch_all' }, true)
          done()
        })
    })
  })
})
