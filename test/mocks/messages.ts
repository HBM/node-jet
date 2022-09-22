import { ValueType } from "../../src/3_jet/types";

export const info = () => ({
  id: "1",
  method: "info",
  params: {},
});
export const configure = (values: Record<string, string>) => ({
  id: "1",
  method: "configure",
  params: { values },
});

export const AddMethod = (path: string) => ({
  id: "1",
  method: "add",
  params: { path },
});
export const AddState = (path: string, value: ValueType) => ({
  id: "1",
  method: "add",
  params: { path, value },
});
export const AddResolve = () => ({ id: "1", message: {}, success: true });
// export const AddReject = ()=>({id:"1",method:"add",params:{path:path}})

export const changeState = (path: string, value: ValueType) => ({
  id: "4",
  method: "change",
  params: { path, value },
});

export const fetchRequest = (path: Record<string, string>, id: string) => ({
  id: "4",
  method: "fetch",
  params: { path, id },
});
export const getRequest = (path: Record<string, string>) => ({
  id: "4",
  method: "get",
  params: { path },
});
export const unfetchRequest = (id: string) => ({
  id: "4",
  method: "unfetch",
  params: { id },
});

export const RemoveRequest = (path: string) => ({
  id: "1",
  method: "remove",
  params: { path },
});
export const RemoveResolve = () => ({ id: "1", message: {}, success: true });

export const SetRequest = (path: string, value: ValueType) => ({
  id: "2",
  method: "set",
  params: { path, value },
});
export const SetResolve = (path: string, value: ValueType) => ({
  id: "2",
  message: { path, value },
  success: true,
});

export const CallRequest = (
  path: string,
  value: ValueType[] | Record<string, ValueType>
) => ({ id: "2", method: "call", params: { path: path, args: value } });
export const CallResolve = () => ({ id: "2", message: [], success: true });
