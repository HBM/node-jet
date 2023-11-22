import { Fetcher } from '../jet.js'

export const events = [
  'authenticate',
  'addUser',
  'configure',
  'info',
  'fetch',
  'unfetch',
  'remove',
  'change',
  'add',
  'data',
  'call',
  'get',
  'set'
] as const
export type EventType = (typeof events)[number]

export const pathRules = [
  'equals',
  'equalsNot',
  'endsWith',
  'startsWith',
  'contains',
  'containsNot',
  'containsAllOf',
  'containsOneOf',
  'startsNotWith',
  'endsNotWith',
  'equalsOneOf',
  'equalsNotOneOf'
] as const
export type PathRule = (typeof pathRules)[number]
export type sortable = 'boolean' | 'number' | 'string'

export type pathFunction = {
  (
    key:
      | 'equals'
      | 'equalsNot'
      | 'endsWith'
      | 'startsWith'
      | 'startsNotWith'
      | 'endsNotWith',
    value: string
  ): Fetcher
  (
    key:
      | 'contains'
      | 'containsNot'
      | 'containsAllOf'
      | 'containsOneOf'
      | 'equalsOneOf'
      | 'equalsNotOneOf',
    value: string[]
  ): Fetcher
}
export interface ValueRule {
  operator: OperatorType
  value: string | number | boolean
}
export type PublishMessage<T extends ValueType> = {
  path: string
  event: string
  value: T
}
export const operators = [
  'greaterThan',
  'lessThan',
  'equals',
  'equalsNot',
  'isType'
] as const
export type OperatorType = (typeof operators)[number]
export interface AccessType {
  id?: string
}
export type ValueType = string | number | object | boolean | null

export type ErrorType = {
  message: string
  stack: string
  lineNumber: number
  fileName: string
}

export const fetchSimpleId = 'fetch_all'
