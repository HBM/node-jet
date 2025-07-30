import type { State } from './peer/state.js'
import type { Method } from './peer/method.js'
import type { JsonRPCError, JSONRPCError } from './errors.js'
import type { ErrorType, ValueType } from './types.js'

 
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
    return err
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
      data
    }
  }
}
export const isState = <T extends ValueType>(
  stateOrMethod: State<T> | Method
): stateOrMethod is State<T> => '_value' in stateOrMethod
