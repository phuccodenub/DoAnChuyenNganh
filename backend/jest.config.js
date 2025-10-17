module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  testMatch: ['**/e2e/**/*.test.ts'],
  moduleNameMapper: {
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@monitoring/(.*)$': '<rootDir>/src/monitoring/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@errors/(.*)$': '<rootDir>/src/errors/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@cache/(.*)$': '<rootDir>/src/cache/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@validates/(.*)$': '<rootDir>/src/validates/$1',
    '^@tracing/(.*)$': '<rootDir>/src/tracing/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
  },
  verbose: false,
  testTimeout: 20000,
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      diagnostics: false,
    }],
  },
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/tests/**',
    '!src/scripts/**',
    '!src/migrations/**'
  ]
};