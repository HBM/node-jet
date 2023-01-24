import { Logger, LogLevel } from '../src/3_jet/log'
import { readFileSync, mkdirSync, rmSync, existsSync } from 'fs'
const tmpDir = '.cache/tmp'
describe('Testing Logging', () => {
  beforeAll(() => {
    if (existsSync(tmpDir)) {
      rmSync(tmpDir, { recursive: true, force: true })
    }
    mkdirSync(tmpDir)
  })
  afterAll(() => {
    try {
      if (existsSync(tmpDir)) {
        rmSync(tmpDir, { recursive: true, force: true })
      }
    } catch {}
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
    return logger.flush().then(() => logger.close())
  }
  describe('Should test callbacks', () => {
    it('Should create empty logger', () => {
      const logger = new Logger()
      log(logger)
    })
    it('Should create sock logger', () => {
      const logSpy = jest.fn()
      const logger = new Logger({
        logLevel: LogLevel.socket,
        logName: 'Foo',
        logCallbacks: [logSpy]
      })
      log(logger)
      expect(logSpy).toHaveBeenCalledTimes(11)
    })
    it('Should create debug logger', () => {
      const logSpy = jest.fn()
      const logger = new Logger({
        logLevel: LogLevel.debug,
        logName: 'Foo',
        logCallbacks: [logSpy]
      })
      log(logger)
      expect(logSpy).toHaveBeenCalledTimes(9)
    })
    it('Should create info logger', () => {
      const logSpy = jest.fn()
      const logger = new Logger({
        logLevel: LogLevel.info,
        logName: 'Foo',
        logCallbacks: [logSpy]
      })
      log(logger)
      expect(logSpy).toHaveBeenCalledTimes(6)
    })
    it('Should create warn logger', () => {
      const logSpy = jest.fn()
      const logger = new Logger({
        logLevel: LogLevel.warn,
        logName: 'Foo',
        logCallbacks: [logSpy]
      })
      log(logger)
      expect(logSpy).toHaveBeenCalledTimes(4)
    })
    it('Should create error logger', () => {
      const logSpy = jest.fn()
      const logger = new Logger({
        logLevel: LogLevel.error,
        logName: 'Foo',
        logCallbacks: [logSpy]
      })
      log(logger)
      expect(logSpy).toHaveBeenCalledTimes(2)
    })
  })
  describe('Should test file', () => {
    it('Should create sock logger', async () => {
      const logFile = `${tmpDir}/sock.txt`
      const logger = new Logger({
        logLevel: LogLevel.socket,
        logName: 'Foo',
        logFile
      })
      await log(logger).then(() => {
        const content = readFileSync(logFile).toString().split('\n')
        expect(content).toHaveLength(12)
        expect(content[0]).toContain('Foo	socket	Bar')
      })
    })
    it('Should create debug logger', async () => {
      const logFile = `${tmpDir}/debug.txt`
      const logger = new Logger({
        logLevel: LogLevel.debug,
        logName: 'Foo',
        logFile
      })
      await log(logger).then(() => {
        const content = readFileSync(logFile).toString().split('\n')
        expect(content).toHaveLength(10)
        expect(content[0]).toContain('Foo	debug	Bar')
      })
    })
    it('Should create info logger', async () => {
      const logFile = `${tmpDir}/info.txt`
      const logger = new Logger({
        logLevel: LogLevel.info,
        logName: 'Foo',
        logFile
      })
      await log(logger).then(() => {
        const content = readFileSync(logFile).toString().split('\n')
        expect(content).toHaveLength(7)
        expect(content[0]).toContain('Foo	info	Bar')
      })
    })
    it('Should create warn logger', async () => {
      const logFile = `${tmpDir}/warn.txt'`
      const logger = new Logger({
        logLevel: LogLevel.warn,
        logName: 'Foo',
        logFile
      })
      await log(logger).then(() => {
        const content = readFileSync(logFile).toString().split('\n')
        expect(content).toHaveLength(5)
        expect(content[0]).toContain('Foo	warn	Bar')
      })
    })
    it('Should create error logger', async () => {
      const logFile = `${tmpDir}/error.txt'`
      const logger = new Logger({
        logLevel: LogLevel.error,
        logName: 'Foo',
        logFile
      })
      await log(logger).then(() => {
        const content = readFileSync(logFile).toString().split('\n')
        expect(content).toHaveLength(3)
        expect(content[0]).toContain('Foo	error	Bar')
      })
    })
  })
})
