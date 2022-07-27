import { DaemonError, ErrorData, invalidParams } from "./errors";
import { AccessType, events, EventType, sortable, ValueType } from "./types";

export interface Message {
  id: string;
}

// const isMember = (msg: Message, field: string | string[]) => {
//   if (Array.isArray(field)) {
//     field.forEach((el) => {
//       if (!(el in msg)) return false;
//     });
//     return true;
//   } else {
//     return field in msg;
//   }
// };
export const castMessage = <T extends MethodRequest>(msg: MethodRequest): T => {
  
  if(!("id" in msg))throw new DaemonError("No id")
  
  if(!("method" in msg)) throw new DaemonError("No method")
  if(!(events.includes(msg.method as EventType)))  throw new DaemonError("Method unknown")
  const method= msg.method as EventType
  const params = msg.params
  switch(method){
    case "info":
      return msg as T;
    case "configure":
      if(!params || !("name" in params))throw invalidParams("Only params.name supported")
      return msg as T;
    case "unfetch":
      if(!params || !("id" in params))throw invalidParams("Fetch id required")
      return msg as T;
    default:
      if(!params || !("path" in params))throw invalidParams("Path required")
  }
  switch(method){
    
    case "fetch":
      if(!("id" in params))throw invalidParams("Fetch id required")
      return msg as T
    case "change":
    case "set":
      if(!("value" in params))throw invalidParams("Value required")
      return msg as T
    default:
        return msg as T
  }
 
};
export interface ResultMessage extends Message {
  result: ValueType;
}

export interface ErrorMessage extends Message {
  error: string | { code: number; data: ErrorData };
}
export interface MethodRequest extends Message {
  method: string;
  params?: object;
}
export interface InfoRequest extends MethodRequest {}
export interface ConfigureRequest extends MethodRequest {}

export interface PathRequest extends MethodRequest {
  params: {
    path: string;
  };
}
export interface UpdateRequest extends MethodRequest {
  params: {
    path: string;
    value: ValueType;
  };
}

export interface AddRequest extends PathRequest {
  params: { path: string; value?: ValueType };
}
export interface SetRequest extends PathRequest {}
export interface CallRequest extends PathRequest {}
export interface RemoveRequest extends PathRequest {}

export interface FetchOptions {
  path: Record<string, string | string[]>;
  id: string;
  sort: {
    asArray?: boolean;
    descending?: boolean;
    byPath?: boolean;
    byValueField?: Record<string, sortable>;
    byValue?: boolean;
    from?: number;
    to?: number;
  };
}
export interface GetRequest extends MethodRequest {
  params: FetchOptions;
}
export interface FetchRequest extends MethodRequest {
  params: FetchOptions;
}
export interface UnFetchRequest extends MethodRequest {
  params: {id: string};
}

export interface ParamType {
  path?: object | string;
  id?: string;
  fetchOnly?: ValueType;
  value?: ValueType;
  access?: AccessType;
  event?: EventType;
  changes?: any;
  valueAsResult?: any;
  n?: any;
  args?: any;
  name?: string;
}
