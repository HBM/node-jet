import { InvalidArgument, invalidRequest, JSONRPCError } from './errors'
import { EventType, OperatorType, ValueType } from './types'

export interface MethodParams {
  path: string
  event: string
  value?: ValueType
}

export interface UnfetchParams {
  id: string
}
export interface FetchParams {
  path: Record<string, string | string[]>
  value: Record<
    string,
    { operator: OperatorType; value: number | boolean | string }
  >
  id: string
  sort: {
    asArray?: boolean
    descending?: boolean
    by?: string
    from?: number
    to?: number
  }
}
export type MessageParams = MethodParams | FetchParams | UnfetchParams
export interface Message {
  id?: string
}

export const castMessage = <T extends MethodRequest>(msg: MethodRequest): T => {
  if (!('method' in msg)) throw new invalidRequest('No method')
  const method = msg.method as EventType
  const params = msg.params
  switch (method) {
    case 'info':
      return msg as T
    case 'configure':
      if (!params || !('name' in params))
        throw new InvalidArgument('Only params.name supported')
      return msg as T
    case 'unfetch':
      if (!params || !('id' in params))
        throw new InvalidArgument('Fetch id required')
      return msg as T
    default:
      if (!params || !('path' in params))
        throw new InvalidArgument('Path required')
  }
  switch (method) {
    case 'fetch':
      if (!('id' in params)) throw new InvalidArgument('Fetch id required')
      return msg as T
    case 'change':
    case 'set':
      if (!('value' in params)) throw new InvalidArgument('Value required')
      return msg as T
    default:
      return msg as T
  }
}
export interface ResultMessage extends Message {
  id: string
  result: ValueType
}

export interface ErrorMessage extends Message {
  id: string
  error: JSONRPCError
}
export interface MethodRequest extends Message {
  id: string
  method: string
  params?: MessageParams
}

export interface PathRequest extends Message {
  id: string
  method: string
  params: {
    path: string
  }
}
export interface UpdateRequest extends Message {
  id: string
  method: string
  params: {
    path: string
    value: ValueType
  }
}

export interface PathParams {
  path: string
  value?: ValueType
  args?: ValueType[] | Record<string, ValueType>
}
export interface AddRequest extends PathRequest {
  params: PathParams
}

export interface GetRequest extends MethodRequest {
  params: FetchParams
}
export interface FetchRequest extends MethodRequest {
  params: FetchParams
}
export interface UnFetchRequest extends MethodRequest {
  params: { id: string }
}
