"use strict";
const errorUrlBase =
  "https://github.com/lipp/node-jet/blob/master/doc/peer.markdown";
export const PARSE_ERROR_CODE = -32600;
export const INVALID_REQUEST = -32600;
export const METHOD_NOT_FOUND = -32601;
export const INVALID_PARAMS_CODE = -32602;
export const INTERNAL_ERROR_CODE = -32603;
export const RESPONSE_TIMEOUT_CODE = -32001;
export const CONNECTION_ERROR_CODE = -32002;

export interface ErrorData {
  url: string;
  name: string;
  details: string;
}
export interface JsonRPCError {
  code: number;
  message: string;
  data?: ErrorData;
}

export class JSONRPCError extends Error implements JSONRPCError {
  code: number;
  message: string;
  data?: ErrorData;
  constructor(code: number, name: string, message: string, details = "") {
    super();
    this.code = code;
    this.name = "jet." + name;
    this.message = message;
    this.data = {
      name: "jet." + name,
      url: errorUrlBase + "#jet" + name.toLowerCase(),
      details: details,
    };
  }
  toString = () =>
    `code: ${this.code} \nname: ${this.name} \n${this.message} \n${this.data}`;
}

export class ParseError extends JSONRPCError {
  constructor(details = "") {
    super(
      PARSE_ERROR_CODE,
      "ParseError",
      "Message could not be parsed",
      details
    );
  }
}
class InvalidParamError extends JSONRPCError {
  constructor(name: string, message: string, details = "") {
    super(INVALID_PARAMS_CODE, name, message, details);
  }
}

export class NotFound extends InvalidParamError {
  constructor(details?: string) {
    super("NotFound", "No State/Method matching the specified path", details);
  }
}
export class InvalidArgument extends InvalidParamError {
  constructor(details?: string) {
    super(
      "InvalidArgument",
      "The provided argument(s) have been refused by the State/Method",
      details
    );
  }
}

export class Occupied extends InvalidParamError {
  constructor(details?: string) {
    super(
      "Occupied",
      "A State/Method with the same path has already been added",
      details
    );
  }
}
export class FetchOnly extends InvalidParamError {
  constructor(details?: string) {
    super("FetchOnly", "The State cannot be modified", details);
  }
}
export class methodNotFoundError extends JSONRPCError {
  constructor(details = "") {
    super(METHOD_NOT_FOUND, "MethodNotFound", "Method not found", details);
  }
}

export class invalidMethod extends JSONRPCError {
  constructor(details?: string) {
    super(
      INVALID_REQUEST,
      "invalidMethod",
      "The path does not support this method",
      details
    );
  }
}
export class invalidRequest extends JSONRPCError {
  constructor(
    name = "invalidRequest",
    message = "Invalid Request",
    details = ""
  ) {
    super(INVALID_REQUEST, name, message, details);
  }
}
export class notAllowed extends invalidRequest {
  constructor(details?: string) {
    super("NotAllowed", "Not allowed", details);
  }
}
// export const responseTimeout = (data: ErrorData) => ({
//   message: "Response Timeout",
//   code: RESPONSE_TIMEOUT_CODE,
//   data: data,
// });

export class ConnectionClosed extends JSONRPCError {
  constructor(details?: string) {
    super(
      CONNECTION_ERROR_CODE,
      "ConnectionClosed",
      "The connection is closed",
      details
    );
  }
}

export class ConnectionInUse extends JSONRPCError {
  constructor(err?: string) {
    super(
      CONNECTION_ERROR_CODE,
      "ConnectionInUse",
      "Could not establish connection",
      err
    );
  }
}
export class PeerTimeout extends JSONRPCError {
  constructor(details?: string) {
    super(
      RESPONSE_TIMEOUT_CODE,
      "PeerTimeout",
      "The peer processing the request did not respond within the specified timeout",
      details
    );
  }
}
