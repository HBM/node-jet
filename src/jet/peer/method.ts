// @ts-nocheck
/**
 * Helpers
 */
import { Message } from "../daemon/access";
import { EventType } from "../fetcher";
import { errorObject, isDefined } from "../utils";
import JsonRPC from "./jsonrpc";
/**
 * Method
 */
export class Method {
  _path: string;
  _access: null;
  _dispatcher!: (message: Message) => void;
  jsonrpc!: JsonRPC;
  constructor(path: string, access = null) {
    this._path = path;
    this._access = access;
  }
  on = (event: EventType, cb: Function) => {
    if (event === "call") {
      // console.log("Creating method dispatcher",this._path, cb)
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
  createSyncDispatcher = (cb: Function) => (message: Message) => {
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
  createAsyncDispatcher = (cb: Function) =>(message: Message) => {
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
  path = () => {
    return this._path;
  };
  add = () => {
    const addDispatcher = (success: boolean) => {
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
