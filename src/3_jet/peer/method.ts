/**
 * Helpers
 */
import { JsonParams } from './index.js'
import { EventEmitter } from '../../1_socket/index.js'
import { ValueType } from '../types.js'
/**
 * A method is a path that can be called. The peer.call method can be used to call methods
 */
export class Method extends EventEmitter {
  _path: string
  private _writeGroup: string
  constructor(path: string, writeGroup = '') {
    super()
    this._path = path
    this._writeGroup = writeGroup
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
    if (this._writeGroup) {
      params.access = { write: this._writeGroup }
    }
    return params
  }
}

export default Method
