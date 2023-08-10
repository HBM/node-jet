import { EventEmitter } from '../../1_socket'
import { Subscription } from '../daemon/subscription'
import { FetchParams } from '../messages'
import {
  PathRule,
  ValueType,
  OperatorType as Operator,
  ValueRule,
  pathFunction
} from '../types'

export class Fetcher extends EventEmitter {
  message: FetchParams = { id: '' }
  valueRules: Record<string, ValueRule> = {}

  constructor() {
    super()
    this.setMaxListeners(0)
  }

  path: pathFunction = (key: PathRule, value: string | string[]) => {
    if (!this.message.path) {
      this.message.path = {}
    }
    this.message.path[key as string] = value
    return this
  }
  value = (
    operator: Operator,
    value: string | boolean | number,
    field = ''
  ) => {
    if (!this.message.value) {
      this.message.value = {}
    }
    this.message.value[field] = {
      operator,
      value
    }
    return this
  }
  matches = (path: string, value: ValueType | undefined): boolean => {
    const sub = new Subscription(this.message)
    return sub.matchesPath(path) && sub.matchesValue(value)
  }

  differential = () => {
    if (!this.message.sort) {
      this.message.sort = {}
    }
    this.message.sort.asArray = false
    return this
  }

  ascending = () => {
    if (!this.message.sort) {
      this.message.sort = {}
    }
    this.message.sort.descending = false
    return this
  }

  descending = () => {
    if (!this.message.sort) {
      this.message.sort = {}
    }
    this.message.sort.descending = true
    return this
  }

  sortByValue = (key = '') => {
    if (!this.message.sort) {
      this.message.sort = {}
    }
    this.message.sort.by = key ? `value.${key}` : 'value'
    return this
  }
  sortByPath = () => {
    if (!this.message.sort) {
      this.message.sort = {}
    }
    this.message.sort.by = 'path'
    return this
  }

  range = (_from: number, _to: number) => {
    if (!this.message.sort) {
      this.message.sort = {}
    }
    this.message.sort.from = _from
    this.message.sort.to = _to
    return this
  }
}

export default Fetcher
