/* eslint-disable strict */
module.exports = {
  cacheDirectory: '<rootDir>/.cache/unit',
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*'],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text', 'text-summary', 'cobertura'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: ['<rootDir>/test'],
  testRegex: '/test/.*\\.(test|spec)?\\.(ts|tsx)$',
  transform: {
    '^.+\\.(js|ts|tsx)?$': ['ts-jest', { isolatedModules: true, useESM: true }]
  },
  transformIgnorePatterns: ['node_modules/(?!nanoid)'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '(.+)\\.js': '$1'
  },
  extensionsToTreatAsEsm: ['.ts']
}
