/**
 * Helpers
 */
import { JsonParams } from '.'
import { EventEmitter } from '../../1_socket'
import { ValueType } from '../types'
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
