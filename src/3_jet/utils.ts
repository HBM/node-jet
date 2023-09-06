import { State } from './peer/state'
import { Method } from './peer/method'
import { JsonRPCError, JSONRPCError } from './errors'
import { ErrorType, ValueType } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
const isJsonRPCError = (
  err: JsonRPCError | string | ErrorType
): err is JsonRPCError =>
  typeof err === 'object' && 'code' in err && 'message' in err

export const errorObject = (err: JSONRPCError | ErrorType | string) => {
  let data
  if (isJsonRPCError(err)) {
    return err as JSONRPCError
  } else {
    data = {} as ErrorType
    if (typeof err === 'string') {
      data.message = err
      data.stack = 'no stack available'
    } else {
      data.message = err.message
      data.stack = err.stack
      data.lineNumber = err.lineNumber
      data.fileName = err.fileName
    }
    return {
      code: -32603,
      message: 'Internal error',
      data: data
    }
  }
}
export const isState = <T extends ValueType>(
  stateOrMethod: State<T> | Method
): stateOrMethod is State<T> => {
  return '_value' in stateOrMethod
}
