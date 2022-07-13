import { InvalidArgument } from "./errors";

export const invalidParams = (data: object | string) => {
  return {
    message: "Invalid params",
    code: -32602,
    data: data,
  };
};

export const parseError = (data: object | string) => {
  return {
    message: "Parse error",
    code: -32700,
    data: data,
  };
};

export const methodNotFound = (data: object | string) => {
  return {
    message: "Method not found",
    code: -32601,
    data: data,
  };
};

export const invalidRequest = (data: object | string) => {
  return {
    message: "Invalid Request",
    code: -32600,
    data: data,
  };
};

export const isDefined = (x: any) => {
  if (typeof x === "undefined" || x === null) {
    return false;
  }
  return true;
};

export const checked = <F>(tab: any, key: string, type: string = ""): F => {
  const p = tab[key];
  if (isDefined(p)) {
    if (type) {
      if (typeof p === type) {
        // eslint-disable-line
        return p;
      } else {
        throw invalidParams({
          wrongType: key,
          got: tab,
        });
      }
    } else {
      return p;
    }
  } else {
    throw invalidParams({
      missingParam: key,
      got: tab,
    });
  }
};

export const optional = <F>(
  tab: any,
  key: string,
  type: string = ""
): F | undefined => {
  const p = tab[key];
  if (isDefined(p)) {
    if (type) {
      if (typeof p === type) {
        // eslint-disable-line
        return p;
      }
    } else {
      throw invalidParams({
        wrongType: key,
        got: tab,
      });
    }
  }
  return undefined;
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
    return err;
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

export const eachKeyValue = (obj: any) => {
  return (f: (arg0: string, arg1: any) => void) => {
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        f(key, obj[key]);
      }
    }
  };
};
