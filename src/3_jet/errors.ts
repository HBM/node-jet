"use strict";

import { ErrorData } from "./messages";

const INVALID_PARAMS_CODE = -32602;
const INTERNAL_ERROR_CODE = -32603;
const RESPONSE_TIMEOUT_CODE = -32001;

export const invalidParams = (data: ErrorData | string) => {
  return {
    message: "Invalid params",
    code: INVALID_PARAMS_CODE,
    data: data,
  };
};

export const methodNotFound = (data: ErrorData | string) => {
  return {
    message: "Method not found",
    code: -32601,
    data: data,
  };
};

export const invalidRequest = (data: ErrorData | string) => {
  return {
    message: "Invalid Request",
    code: -32600,
    data: data,
  };
};

export const responseTimeout = (data: ErrorData) => {
  return {
    message: "Response Timeout",
    code: RESPONSE_TIMEOUT_CODE,
    data: data,
  };
};

/**
 * @module errors
 * @desc
 *
 * A pseudo-module for grouping all error classes.
 *
 * All error classes are available as members of the Jet module
 *
 * ```javascript
 * var jet = require('node-jet')
 * var err = new jet.InvalidArguments('wrong type')
 * ```
 *
 */

/**
 * @class
 * @classdesc
 * The base class for all jet errors.
 *
 */
export class BaseError extends Error {
  url = "";
  constructor(
    name: string,
    message: string | undefined,
    strStack = "no remote stack"
  ) {
    super(message);
    this.name = "jet." + name;
    const errorUrlBase =
      "https://github.com/lipp/node-jet/blob/master/doc/peer.markdown";
    this.url = errorUrlBase + "#jet" + name.toLowerCase();
    this.stack = strStack;
  }
}

/**
 * A url which points to a website describing the error in more depth.
 * @var {string} url
 * @memberof module:errors~BaseError.prototype
 *
 */

/**
 * The class name of the error
 * @var {string} name
 * @memberof module:errors~BaseError.prototype
 *
 */

/**
 * The error message.
 * @var {string} message
 * @memberof module:errors~BaseError.prototype
 *
 */

/**
 * The (remote) stacktrace of the exception.
 * @var {string} stack
 * @memberof module:errors~BaseError.prototype
 *
 */

export class DaemonError extends BaseError {
  constructor(msg: string) {
    super("DaemonError", msg);
  }
}

/**
 * Creates a new instance.
 * @classdesc The Peer processing the 'set' or 'get' request threw an error during dispatching the request.
 * @class
 * @augments module:errors~BaseError
 *
 */

export class PeerError extends BaseError {
  constructor(_msg: string) {
    super("PeerError", _msg);
  }
}

/**
 * Creates a new instance.
 * @classdesc The user (name) provided is not registered at the Daemon.
 * @class
 * @augments module:errors~BaseError
 *
 */
export class InvalidUser extends BaseError {
  constructor() {
    super("InvalidUser", "The specified user does not exist");
  }
}

/**
 * Creates a new instance.
 * @classdesc The password provided for the user is not correct.
 * @class
 * @augments module:errors~BaseError
 *
 */
export class InvalidPassword extends BaseError {
  constructor() {
    super("InvalidPassword", "The specified password is wrong");
  }
}

/**
 * Creates a new instance.
 * @classdesc The peer (user/password) is not authorized to perform the requested action.
 * @class
 * @augments module:errors~BaseError
 *
 */

export class Unauthorized extends BaseError {
  constructor() {
    super("Unauthorized", "The request is not authorized for the user");
  }
}

/**
 * Creates a new instance.
 * @classdesc The connection to the specified endpoint could not be established or has been closed.
 * @class
 * @augments module:errors~BaseError
 *
 */
export class ConnectionClosed extends BaseError {
  constructor(err: string) {
    super("ConnectionClosed", err);
  }
}

/**
 * Creates a new instance.
 * @classdesc The State or Method specified by `path` has not been added to the Daemon. One
 * could `fetch` the respective State or Method to wait until it becomes available.
 * @class
 * @augments module:errors~BaseError
 *
 */

export class NotFound extends BaseError {
  constructor() {
    super("NotFound", "No State/Method matching the specified path");
  }
}

/**
 * Creates a new instance.
 * @classdesc The provided arguments for 'set' or 'call' have been refused by the State or Method.
 * @class
 * @param {string} [message] A custom error message to forward to the requestor.
 * @augments module:errors~BaseError
 *
 */

export class InvalidArgument extends BaseError {
  constructor(msg: string) {
    super(
      "InvalidArgument",
      msg || "The provided argument(s) have been refused by the State/Method"
    );
  }
}

/**
 * Creates a new instance.
 * @classdesc The Peer processing the 'set' or 'call' request has not answered within the specified `timeout`.
 * @class
 * @augments module:errors~BaseError
 *
 */

export class PeerTimeout extends BaseError {
  constructor() {
    super(
      "PeerTimeout",
      "The peer processing the request did not respond within the specified timeout"
    );
  }
}

/**
 * Creates a new instance.
 * @classdesc The state or method cannot be added to the Daemon because another state or method with the
 * same `path` already exists.
 * @class
 * @augments module:errors~BaseError
 *
 */

export class Occupied extends BaseError {
  constructor() {
    super(
      "Occupied",
      "A State/Method with the same path has already been added"
    );
  }
}

/**
 * Creates a new instance.
 * @classdesc The state or method is fetch-only (aka read-only).
 * @class
 * @augments module:errors~BaseError
 *
 */

export class FetchOnly extends BaseError {
  constructor() {
    super("FetchOnly", "The State cannot be modified");
  }
}

export const createTypedError = (jsonrpcError: {
  code: number;
  data: ErrorData | string;
}) => {
  const code = jsonrpcError.code;
  if (code === INVALID_PARAMS_CODE) {
    const data = jsonrpcError.data as ErrorData;
    if (data.pathNotExists) {
      return new NotFound();
    } else if (data.pathAlreadyExists) {
      return new Occupied();
    } else if (data.fetchOnly) {
      return new FetchOnly();
    } else if (data.invalidUser) {
      return new InvalidUser();
    } else if (data.invalidPassword) {
      return new InvalidPassword();
    } else if (data.invalidArgument) {
      return new InvalidArgument(
        data.invalidArgument && data.invalidArgument.message
      );
    } else if (data.noAccess) {
      return new Unauthorized();
    }
  } else if (code === RESPONSE_TIMEOUT_CODE) {
    return new PeerTimeout();
  } else if (code === INTERNAL_ERROR_CODE) {
    const data = jsonrpcError.data as string;
    return new PeerError(data);
  }
};
