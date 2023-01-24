'use strict'

import { ValueType } from '../types'
import { JsonParams } from '.'
import { EventEmitter } from '../../1_socket'

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
export class State<T = ValueType> extends EventEmitter {
  _path: string
  _value: T
  _readonly: boolean
  constructor(path: string, initialValue: T, readonly = false) {
    super()
    this._path = path
    this._value = initialValue
    this._readonly = readonly
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
    value: this._value
  })
}

export default State
