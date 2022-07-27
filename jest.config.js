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
  transform: { '^.+\\.(js|ts|tsx)?$': 'ts-jest' },
  "transformIgnorePatterns": [
    "node_modules/(?!uuid)"
  ],
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
}
