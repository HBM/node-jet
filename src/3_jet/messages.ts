import { AccessType, EventType, sortable, ValueType } from "./types";

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
export const castMessage = <T extends Message>(msg: Message): T => {
  return msg as T;
};
export interface ResultMessage extends Message {
  result: ValueType;
}
export interface ErrorData {
  pathNotExists?: string;
  pathAlreadyExists?: string;
  fetchOnly?: string;
  invalidUser?: string;
  invalidPassword?: string;
  invalidArgument?: { message: string };
  noAccess?: string;
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
export interface GetRequest extends PathRequest {}
export interface AddRequest extends PathRequest {
  params: { path: string; value?: ValueType };
}
export interface SetRequest extends PathRequest {}
export interface CallRequest extends PathRequest {}
export interface RemoveRequest extends PathRequest {}

export interface FetchOptions {
  path: Record<string, string | string[]>;
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
export interface FetchRequest extends Message {
  params: FetchOptions;
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
