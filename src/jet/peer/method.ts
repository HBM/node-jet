/**
 * Helpers
 */
import { errorObject, isDefined } from "../utils";
import JsonRPC from "./jsonrpc";
/**
 * Method
 */
export class Method {
  _path: any;
  _access: null;
  _dispatcher!: { (message: any): void; (message: any): void };
  jsonrpc!: JsonRPC;
  constructor(path: any, access = null) {
    this._path = path;
    this._access = access;
  }
  on = (event: string, cb: any) => {
    if (event === "call") {
      if (cb.length <= 1) {
        this._dispatcher = this.createSyncDispatcher(cb);
      } else {
        this._dispatcher = this.createAsyncDispatcher(cb);
      }
      return this;
    } else {
      throw new Error("event not available");
    }
  };
  createSyncDispatcher = (cb: any) => {
    const dispatch = (message: { params: any; id: any }) => {
      const params = message.params;
      let result;
      let err;
      try {
        result = cb.call(this, params);
      } catch (e) {
        err = e;
      }
      const mid = message.id;
      if (isDefined(mid)) {
        if (!isDefined(err)) {
          this.jsonrpc.queue({
            id: mid,
            result: result !== undefined ? result : {},
          });
        } else {
          this.jsonrpc.queue({
            id: mid,
            error: errorObject(err),
          });
        }
      }
    };
    return dispatch;
  };
  createAsyncDispatcher = (cb: any) => {
    const dispatch = (message: { id: any; params: any }) => {
      const mid = message.id;
      const reply = (resp: { result?: any; error?: any }) => {
        resp = resp || {};
        if (isDefined(mid)) {
          const response = {
            id: mid,
            error: undefined,
            result: undefined,
          };
          if (isDefined(resp.result) && !isDefined(resp.error)) {
            response.result = resp.result;
          } else if (isDefined(resp.error)) {
            response.error = errorObject(resp.error);
          } else {
            response.error = errorObject(
              "jet.peer Invalid async method response " + this._path
            );
          }
          this.jsonrpc.queue(response);
          this.jsonrpc.flush();
        }
      };

      const params = message.params;

      try {
        cb.call(this, params, reply);
      } catch (err) {
        if (isDefined(mid)) {
          this.jsonrpc.queue({
            id: mid,
            error: errorObject(err),
          });
        }
      }
    };
    return dispatch;
  };
  path = () => {
    return this._path;
  };
  add = () => {
    const addDispatcher = (success: any) => {
      if (success) {
        this.jsonrpc.addRequestDispatcher(this._path, this._dispatcher);
      }
    };
    const params = {
      path: this._path,
      access: this._access,
    };
    return this.jsonrpc.service("add", params, addDispatcher);
  };
  remove = () => {
    const params = {
      path: this._path,
    };
    const removeDispatcher = () => {
      this.jsonrpc.removeRequestDispatcher(this._path);
    };
    return this.jsonrpc.service("remove", params, removeDispatcher);
  };
  isAdded = () => {
    return this.jsonrpc.hasRequestDispatcher(this._path);
  };
}

export default Method;
