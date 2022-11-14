import { Logger, LogLevel } from '../src/3_jet/log'
import { readFileSync, mkdirSync, rmSync } from 'fs'
describe('Testing Logging', () => {
  beforeAll(() => {
    mkdirSync('tmp')
  })
  afterAll(() => {
    rmSync('tmp', { recursive: true })
  })
  const log = (logger: Logger) => {
    logger.log('Bar', LogLevel.socket)
    logger.log('Bar') //Default is debug
    logger.log('Bar', LogLevel.debug)
    logger.log('Bar', LogLevel.info)
    logger.log('Bar', LogLevel.warn)
    logger.log('Bar', LogLevel.error)
    logger.sock('Bar')
    logger.debug('Bar')
    logger.info('Bar')
    logger.warn('Bar')
    logger.error('Bar')
    return logger.flush()
  }
  describe('Should test callbacks', () => {
    it('Schould create empty logger', () => {
      const logger = new Logger()
      log(logger)
    })
    it('Schould create sock logger', () => {
      const logSpy = jest.fn()
      const logger = new Logger({
        loglevel: LogLevel.socket,
        logname: 'Foo',
        logCallbacks: [logSpy]
      })
      log(logger)
      expect(logSpy).toHaveBeenCalledTimes(11)
    })
    it('Schould create debug logger', () => {
      const logSpy = jest.fn()
      const logger = new Logger({
        loglevel: LogLevel.debug,
        logname: 'Foo',
        logCallbacks: [logSpy]
      })
      log(logger)
      expect(logSpy).toHaveBeenCalledTimes(9)
    })
    it('Schould create info logger', () => {
      const logSpy = jest.fn()
      const logger = new Logger({
        loglevel: LogLevel.info,
        logname: 'Foo',
        logCallbacks: [logSpy]
      })
      log(logger)
      expect(logSpy).toHaveBeenCalledTimes(6)
    })
    it('Schould create warn logger', () => {
      const logSpy = jest.fn()
      const logger = new Logger({
        loglevel: LogLevel.warn,
        logname: 'Foo',
        logCallbacks: [logSpy]
      })
      log(logger)
      expect(logSpy).toHaveBeenCalledTimes(4)
    })
    it('Schould create error logger', () => {
      const logSpy = jest.fn()
      const logger = new Logger({
        loglevel: LogLevel.error,
        logname: 'Foo',
        logCallbacks: [logSpy]
      })
      log(logger)
      expect(logSpy).toHaveBeenCalledTimes(2)
    })
  })
  describe('Should test file', () => {
    it('Schould create empty logger', () => {
      const logger = new Logger()
      log(logger)
    })
    it('Schould create sock logger', (done) => {
      const logger = new Logger({
        loglevel: LogLevel.socket,
        logname: 'Foo',
        logfile: 'tmp/sock.txt'
      })
      log(logger).then(() => {
        const content = readFileSync('tmp/sock.txt').toString().split('\n')
        expect(content).toHaveLength(12)
        expect(content[0]).toContain('Foo	socket	Bar')
        done()
      })
    })
    it('Schould create debug logger', (done) => {
      const logger = new Logger({
        loglevel: LogLevel.debug,
        logname: 'Foo',
        logfile: 'tmp/debug.txt'
      })
      log(logger).then(() => {
        const content = readFileSync('tmp/debug.txt').toString().split('\n')
        expect(content).toHaveLength(10)
        expect(content[0]).toContain('Foo	debug	Bar')
        done()
      })
    })
    it('Schould create info logger', (done) => {
      const logger = new Logger({
        loglevel: LogLevel.info,
        logname: 'Foo',
        logfile: 'tmp/info.txt'
      })
      log(logger).then(() => {
        const content = readFileSync('tmp/info.txt').toString().split('\n')
        expect(content).toHaveLength(7)
        expect(content[0]).toContain('Foo	info	Bar')
        done()
      })
    })
    it('Schould create warn logger', (done) => {
      const logger = new Logger({
        loglevel: LogLevel.warn,
        logname: 'Foo',
        logfile: 'tmp/warn.txt'
      })
      log(logger).then(() => {
        const content = readFileSync('tmp/warn.txt').toString().split('\n')
        expect(content).toHaveLength(5)
        expect(content[0]).toContain('Foo	warn	Bar')
        done()
      })
    })
    it('Schould create error logger', (done) => {
      const logger = new Logger({
        loglevel: LogLevel.error,
        logname: 'Foo',
        logfile: 'tmp/error.txt'
      })
      log(logger).then(() => {
        const content = readFileSync('tmp/error.txt').toString().split('\n')
        expect(content).toHaveLength(3)
        expect(content[0]).toContain('Foo	error	Bar')
        done()
      })
    })
  })
})
