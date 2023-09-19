/**
 * Helpers
 */
import { JsonParams } from '.'
import { EventEmitter } from '../../1_socket/index.js'
import { ValueType } from '../types.js'
/**
 * A method is a path that can be called. The peer.call method can be used to call methods
 */
export class Method extends EventEmitter {
  _path: string
  constructor(path: string) {
    super()
    this._path = path
  }

  path = () => {
    return this._path
  }

  call = (args: ValueType[] | Record<string, ValueType> | undefined) => {
    this.emit('call', args)
  }

  toJson = () => {
    const params: JsonParams = {
      path: this._path
    }
    return params
  }
}

export default Method
