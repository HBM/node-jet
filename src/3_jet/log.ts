import * as fs from 'fs'
export enum LogLevel {
  'socket' = 1,
  'debug',
  'info',
  'warn',
  'error',
  'none'
}

type LogFunction = (...args: string[]) => void
export interface logger {
  logName: string
  logLevel?: LogLevel
  logFile?: string
  logCallbacks?: LogFunction[]
}
/**
 * Logger class used for logging. Logging can be done to a file to the console or to any callback
 */
export class Logger {
  logName: string
  logLevel: LogLevel
  callBacks: LogFunction[] | undefined
  stream: fs.WriteStream | undefined
  /**
   * Constructor to create a new Logger instance
   * @param settings
   */
  constructor(settings: logger = { logName: 'None' }) {
    this.logName = settings.logName
    this.logLevel = settings.logLevel || LogLevel['none']
    this.callBacks = settings.logCallbacks
    if (settings.logFile) {
      this.stream = fs.createWriteStream(settings.logFile)
    }
  }
  /**
   * Function that transforms a message into a string of the format "<Date> <Time> <LogName> <LogLevel> <Message>"
   * @param msg
   * @param level
   * @returns string
   */
  stringBuilder(msg: string, level: LogLevel) {
    const date = new Date(Date.now())
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}\t${
      this.logName
    }\t${LogLevel[level]}\t${msg}`
  }
  /**
   * Function called to log a message. Messages are only logged if the provided message log level is greater then the configured log level
   * @param msg
   * @param level
   * @returns string
   */
  log(msg: string, level = LogLevel.debug) {
    if (this.logLevel > level) {
      return
    }
    const logMessage = this.stringBuilder(msg, level)
    if (this.stream) {
      this.stream.write(logMessage)
      this.stream.write('\n')
    }
    if (this.callBacks) {
      this.callBacks.every((cb) => cb(logMessage))
    }
  }
  /**
   * Log a message on the socket level
   * @param msg
   */
  sock(msg: string) {
    this.log(msg, LogLevel.socket)
  }
  /**
   * Log a message on the debug level
   * @param msg
   */
  debug(msg: string) {
    this.log(msg, LogLevel.debug)
  }
  /**
   * Log a Info message
   * @param msg
   */
  info(msg: string) {
    this.log(msg, LogLevel.info)
  }
  /**
   * Log a warn message
   * @param msg
   */
  warn(msg: string) {
    this.log(msg, LogLevel.warn)
  }
  /**
   * Log an error message
   * @param msg
   */
  error(msg: string) {
    this.log(msg, LogLevel.error)
  }
  /**
   * Function that can be called to wait until the stream has completed to write everything
   */
  flush(): Promise<void> {
    return new Promise((resolve) => {
      if (this.stream) {
        const interval = setInterval(() => {
          if (!this.stream || !this.stream.pending) {
            clearInterval(interval)
            resolve()
          }
        })
      }
    })
  }
  /**
   * Function to close the Logger and the fileStream in case any fileStream was used
   */
  close() {
    if (this.stream) {
      this.stream.end()
    }
  }
}
