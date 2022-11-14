import { State } from './peer/state'
import { Method } from './peer/method'
import { JSONRPCError } from './errors'
import { ValueType } from './types'

export const getValue = (o: any, field: string) => {
  if (field === '') return o
  const keys = field.split('.')
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (key in o) {
      o = o[key]
    } else {
      return undefined
    }
  }
  return o
}
export const errorObject = (err: any) => {
  let data
  if (typeof err === 'object' && err.code && err.message) {
    return err as JSONRPCError
  } else {
    data = {} as any
    if (typeof err === 'object') {
      data.message = err.message
      data.stack = err.stack
      data.lineNumber = err.lineNumber
      data.fileName = err.fileName
    } else {
      data.message = err
      data.stack = 'no stack available'
    }
    return {
      code: -32603,
      message: 'Internal error',
      data: data
    }
  }
}
export const isState = (
  stateOrMethod: State<ValueType> | Method
): stateOrMethod is State<ValueType> => {
  return '_value' in stateOrMethod
}
