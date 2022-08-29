/**
 * Helpers
 */
import EventEmitter from "events";
import { JsonParams } from ".";
import { AccessType } from "../types";
/**
 * Method
 */
export class Method extends EventEmitter {
  _path: string;
  _access: AccessType | null;
  constructor(path: string, access: AccessType | null = null) {
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

  toJson = () => {
    const params: JsonParams = {
      path: this._path,
    };
    if (this._access) params.access = this._access;
    return params;
  };
}

export default Method;
