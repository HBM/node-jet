'use strict'

import { ValueType } from '../types'
import { JsonParams } from '.'
import { EventEmitter } from '../../1_socket'
import { invalidState } from '../errors'

/**
 * Create a Jet State instance
 * @class
 * @classdesc A Jet State associates a unique path with any piece of
 * cohesive data. The data may represent a Database entry, the configuration
 * of a certain part of software or observations of "real" things (through sensors).
 * A State can change its value at any time. It also can provide "behaviour" by providing
 * a "set" event handler. This event handler can do whatever seems appropriate (validation etc) and may
 * result in an auto-posted state change.
 *
 * @param {string} path A unique name, which identifies this State, e.g. 'persons/#23A51'
 * @param {*} initialValue The initial value of the state.
 * @param {object} [access] Access rights for this state. Per default unrestricted access to all Peers.
 *
 */
export class State<T extends ValueType> extends EventEmitter {
  _path: string
  _value: T
  _readGroup: string
  _writeGroup: string
  constructor(path: string, initialValue: T, readgroup="all",writeGroup="all") {
    super()
    this._path = path
    this._value = initialValue
    this._readGroup = readgroup
    this._writeGroup = writeGroup
    if (typeof path === 'undefined') {
      throw new invalidState(`${path} is not allowed in path`)
    }
  }

  /**
   * Get the state's unchangable path.
   *
   * @returns {string} The state's path.
   *
   */
  path = () => this._path

  /**
   * Replies to a 'set' request. Either set `response.value` or `response.error`.
   * Only required for asynchronous working {State~setCallback}.
   *
   * @function State~reply
   * @param {object} response The response to send to the invoker of the 'set' callback.
   * @param {*} [response.value] The new State's value.
   * @param {Boolean} [response.dontNotify=false] If set to true, no state change is posted.
   * @param {string|object} [response.error] A error message or error object.
   *
   */

  value = (newValue: T | undefined = undefined) => {
    if (newValue !== undefined && newValue !== this._value) {
      this._value = newValue
      this.emit('change', newValue)
    }
    return this._value
  }

  toJson = (): JsonParams<T> => ({
    path: this._path,
    value: this._value,
    access: {read:this._readGroup,write:this._writeGroup}
  })
}

export default State
