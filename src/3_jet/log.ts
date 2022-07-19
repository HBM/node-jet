import * as fs from "fs";
export enum LogLevel {
  "socket" = 1,
  "debug",
  "info",
  "warn",
  "error",
  "none",
}

type LogFunction = (...args: any[]) => void;
export interface logger {
  logname: string;
  loglevel?: LogLevel;
  logfile?: string;
  logCallbacks?: LogFunction[];
}

export class Logger {
  logName: string;
  logLevel: LogLevel;
  callBacks: LogFunction[] | undefined;
  stream: fs.WriteStream | undefined;
  constructor(settings: logger={logname:"None"}) {
    this.logName = settings.logname;
    this.logLevel = settings.loglevel || LogLevel["none"];
    this.callBacks = settings.logCallbacks;
    if (settings.logfile) {
      this.stream = fs.createWriteStream(settings.logfile);
    }
  }

  stringbuilder = (msg: string, level: LogLevel) => {
    return `${new Date(Date.now())}\t${this.logName}\t${
      LogLevel[level]
    }\t${msg}`;
  };

  log(msg: string, level = LogLevel.debug) {
    if (this.logLevel > level) {
      return;
    }
    const logmessage = this.stringbuilder(msg, level);
    if (this.stream) {
      this.stream.write(logmessage);
    }
    if (this.callBacks) {
      this.callBacks.every((cb) => cb(logmessage));
    }
  }
  sock(msg: string) {
    this.log(msg, LogLevel.socket);
  }
  debug(msg: string) {
    this.log(msg, LogLevel.debug);
  }
  info(msg: string) {
    this.log(msg, LogLevel.info);
  }
  warn(msg: string) {
    this.log(msg, LogLevel.warn);
  }
  error(msg: string) {
    this.log(msg, LogLevel.error);
  }
}
