import { Logger, LogLevel } from '../src/3_jet/log'
import { readFileSync, mkdirSync, rmSync, existsSync } from 'fs'
describe('Testing Logging', () => {
  beforeAll(() => {
    if (existsSync('tmp')) {
      rmSync('tmp', { recursive: true })
    }
    mkdirSync('tmp')
  })
  afterAll(() => {
    if (existsSync('tmp')) {
      rmSync('tmp', { recursive: true })
    }
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
    it('Should create empty logger', () => {
      const logger = new Logger()
      log(logger)
    })
    it('Should create sock logger', () => {
      const logSpy = jest.fn()
      const logger = new Logger({
        loglevel: LogLevel.socket,
        logname: 'Foo',
        logCallbacks: [logSpy]
      })
      log(logger)
      expect(logSpy).toHaveBeenCalledTimes(11)
    })
    it('Should create debug logger', () => {
      const logSpy = jest.fn()
      const logger = new Logger({
        loglevel: LogLevel.debug,
        logname: 'Foo',
        logCallbacks: [logSpy]
      })
      log(logger)
      expect(logSpy).toHaveBeenCalledTimes(9)
    })
    it('Should create info logger', () => {
      const logSpy = jest.fn()
      const logger = new Logger({
        loglevel: LogLevel.info,
        logname: 'Foo',
        logCallbacks: [logSpy]
      })
      log(logger)
      expect(logSpy).toHaveBeenCalledTimes(6)
    })
    it('Should create warn logger', () => {
      const logSpy = jest.fn()
      const logger = new Logger({
        loglevel: LogLevel.warn,
        logname: 'Foo',
        logCallbacks: [logSpy]
      })
      log(logger)
      expect(logSpy).toHaveBeenCalledTimes(4)
    })
    it('Should create error logger', () => {
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
    it('Should create sock logger', async () => {
      const logger = new Logger({
        loglevel: LogLevel.socket,
        logname: 'Foo',
        logfile: 'tmp/sock.txt'
      })
      await log(logger).then(() => {
        const content = readFileSync('tmp/sock.txt').toString().split('\n')
        expect(content).toHaveLength(12)
        expect(content[0]).toContain('Foo	socket	Bar')
      })
    })
    it('Should create debug logger', async () => {
      const logger = new Logger({
        loglevel: LogLevel.debug,
        logname: 'Foo',
        logfile: 'tmp/debug.txt'
      })
      await log(logger).then(() => {
        const content = readFileSync('tmp/debug.txt').toString().split('\n')
        expect(content).toHaveLength(10)
        expect(content[0]).toContain('Foo	debug	Bar')
      })
    })
    it('Should create info logger', async () => {
      const logger = new Logger({
        loglevel: LogLevel.info,
        logname: 'Foo',
        logfile: 'tmp/info.txt'
      })
      await log(logger).then(() => {
        const content = readFileSync('tmp/info.txt').toString().split('\n')
        expect(content).toHaveLength(7)
        expect(content[0]).toContain('Foo	info	Bar')
      })
    })
    it('Should create warn logger', async () => {
      const logger = new Logger({
        loglevel: LogLevel.warn,
        logname: 'Foo',
        logfile: 'tmp/warn.txt'
      })
      await log(logger).then(() => {
        const content = readFileSync('tmp/warn.txt').toString().split('\n')
        expect(content).toHaveLength(5)
        expect(content[0]).toContain('Foo	warn	Bar')
      })
    })
    it('Should create error logger', async () => {
      const logger = new Logger({
        loglevel: LogLevel.error,
        logname: 'Foo',
        logfile: 'tmp/error.txt'
      })
      await log(logger).then(() => {
        const content = readFileSync('tmp/error.txt').toString().split('\n')
        expect(content).toHaveLength(3)
        expect(content[0]).toContain('Foo	error	Bar')
      })
    })
  })
})
