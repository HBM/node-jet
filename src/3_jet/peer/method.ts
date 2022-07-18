/**
 * Helpers
 */
import EventEmitter from "events";
/**
 * Method
 */
export class Method extends EventEmitter.EventEmitter {
  _path: string;
  _access: null;
  constructor(path: string, access = null) {
    super();
    this._path = path;
    this._access = access;
  }

  path = () => {
    return this._path;
  };

  call = (args: any) => {
    this.emit("call", args);
  };
}

export default Method;
