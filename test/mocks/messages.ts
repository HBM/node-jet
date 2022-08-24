import { ValueType } from "../../src/3_jet/types";

export const AddMethod = (path: string) => ({
  id: "1",
  method: "add",
  params: { path: path },
});
export const AddState = (path: string, value: ValueType) => ({
  id: "1",
  method: "add",
  params: { path: path, value: value },
});
export const AddResolve = () => ({ id: "1", message: {}, success: true });
// export const AddReject = ()=>({id:"1",method:"add",params:{path:path}})

export const changeState = (path: string, value: ValueType) => ({
  id: "4",
  method: "change",
  params: { path: path, value: value },
});

export const RemoveRequest = (path: string) => ({
  id: "1",
  method: "remove",
  params: { path: path },
});
export const RemoveResolve = () => ({ id: "1", message: {}, success: true });

export const SetRequest = (path: string, value: ValueType) => ({
  id: "2",
  method: "set",
  params: { path: path, value: value },
});
export const SetResolve = (path: string, value: ValueType) => ({
  id: "2",
  message: { path: path, value: value },
  success: true,
});

export const CallRequest = (
  path: string,
  value: ValueType[] | Record<string, ValueType>
) => ({ id: "2", method: "call", params: { path: path, args: value } });
export const CallResolve = () => ({ id: "2", message: [], success: true });
