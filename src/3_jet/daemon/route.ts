'use strict'
import { EventEmitter } from '../../1_socket'
import JsonRPC from '../../2_jsonrpc'
import { ValueType } from '../types'
/**
 * A Route is a path and corresponds to a state.
 * The daemon keeps a local cache of all registered routes and all momentary values.
 * The corresponding owner of a route is also remembered
 */
export class Route extends EventEmitter {
  owner: JsonRPC
  value?: ValueType
  path: string
  constructor(
    owner: JsonRPC,
    path: string,
    value: ValueType | undefined = undefined
  ) {
    super()
    this.owner = owner
    this.value = value
    this.path = path
  }

  updateValue = (newValue: ValueType) => {
    if (newValue === this.value) return
    this.value = newValue
    this.emit('Change', this.path, newValue)
  }
  remove = () => this.emit('Remove', this.path)
}
