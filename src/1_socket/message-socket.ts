/* istanbul ignore file */
import { Socket, connect } from 'net'
import { EventEmitter } from '.'

/**
 * Class Message socket
 */
export class MessageSocket extends EventEmitter {
  last = Buffer.alloc(0)
  len = -1
  socket: Socket
  constructor(port: number | Socket, ip = '') {
    super()
    if (port instanceof Socket) {
      this.socket = port
    } else {
      this.socket = connect(port as number, ip)
      this.socket.on('connect', () => {
        this.emit('open')
      })
    }

    this.socket.on('data', (buf: Uint8Array) => {
      let bigBuf = Buffer.concat([this.last, buf])
      while (true) {
        // eslint-disable-line no-constant-condition
        if (this.len < 0) {
          if (bigBuf.length < 4) {
            this.last = bigBuf
            return
          } else {
            this.len = bigBuf.readUInt32BE(0)
            bigBuf = bigBuf.subarray(4)
          }
        }
        if (this.len > 0) {
          if (bigBuf.length < this.len) {
            this.last = bigBuf
            return
          } else {
            this.emit('message', bigBuf.toString(undefined, 0, this.len))
            bigBuf = bigBuf.subarray(this.len)
            this.len = -1
          }
        }
      }
    })

    this.socket.setNoDelay(true)
    this.socket.setKeepAlive(true)

    this.socket.once('close', () => {
      this.emit('close')
    })

    this.socket.once('error', (e: Error) => {
      this.emit('error', e)
    })
  }
  /**
   * Send.
   */
  send(msg: string) {
    const utf8Length = Buffer.byteLength(msg, 'utf8')
    const buf = Buffer.alloc(4 + utf8Length)
    buf.writeUInt32BE(utf8Length, 0)
    buf.write(msg, 4)
    process.nextTick(() => {
      this.socket.write(buf)
      this.emit('sent', msg)
    })
  }
  /**
   * Close.
   */
  close() {
    this.socket.end()
  }
  /**
   * addEventListener method needed for MessageSocket to be used in the browser.
   * It is a wrapper for plain EventEmitter events like ms.on('...', callback).
   *
   * npm module 'ws' also comes with this method.
   * See https://github.com/websockets/ws/blob/master/lib/WebSocket.js#L410
   * That way we can use node-jet with via browserify inside the browser.
   */
  addEventListener(
    method: string | symbol,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: { (...args: any[]): void; call?: any }
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onMessage = (data: any) => {
      listener.call(this, new MessageEvent('data', { data: data }))
    }

    const onClose = (code: string, message: CloseEventInit) => {
      listener.call(this, new CloseEvent(code, message))
    }

    const onError = (event: Event) => {
      listener.call(this, event)
    }

    const onOpen = () => {
      listener.call(this, new Event('open'))
    }

    if (typeof listener === 'function') {
      let cb
      switch (method) {
        case 'message':
          cb = onMessage
          break
        case 'close':
          cb = onClose
          break
        case 'error':
          cb = onError
          break
        case 'open':
          cb = onOpen
          break
        default:
          cb = listener
      }
      this.on(method, cb)
    }
  }
}

export default MessageSocket
