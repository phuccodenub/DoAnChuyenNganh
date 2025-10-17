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
  },
  verbose: false,
  testTimeout: 20000,
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true,
      diagnostics: false,
    }],
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './src/modules/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/utils/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    },
    './src/services/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
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