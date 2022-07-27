import { State, Method } from "../jet";
import { ErrorObject, InvalidArgument, invalidParams } from "./errors";
import { ValueType } from "./types";

export const isDefined = (x: any) => {
  if (typeof x === "undefined" || x === null) {
    return false;
  }
  return true;
};

export const accessField = (fieldStr: string) => {
  if (fieldStr.substring(0, 1) !== "[") {
    fieldStr = "." + fieldStr;
  }
  const funStr = "return t" + fieldStr;
  return new Function("t", funStr); // eslint-disable-line no-new-func
};

export const errorObject = (err: any) => {
  let data;
  if (
    typeof err === "object" &&
    isDefined(err.code) &&
    isDefined(err.message)
  ) {
    return err as ErrorObject;
  } else {
    if (err instanceof InvalidArgument) {
      return invalidParams({
        invalidArgument: err,
      });
    } else {
      data = {} as any;
      if (typeof err === "object") {
        data.message = err.message;
        data.stack = err.stack;
        data.lineNumber = err.lineNumber;
        data.fileName = err.fileName;
      } else {
        data.message = err;
        data.stack = "no stack available";
      }
      return {
        code: -32603,
        message: "Internal error",
        data: data,
      };
    }
  }
};
export const isState = (stateOrMethod: State<ValueType> | Method ): stateOrMethod is State<ValueType> => {
  return "_value" in stateOrMethod;
};
