module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts',
    '**/e2e/**/*.test.ts'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/src/swagger/',
  ],
  verbose: false,
  testTimeout: 20000,
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      diagnostics: false,
    }],
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      statements: 15,
      branches: 9,
      functions: 10,
      lines: 15
    }
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/tests/**',
    '!src/server.ts',
    '!src/app.ts',
    '!src/scripts/**',
    '!src/migrations/**',
    '!src/seeders/**'
  ],
  setupFiles: ['<rootDir>/src/tests/jest.env.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@monitoring/(.*)$': '<rootDir>/src/monitoring/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@errors/(.*)$': '<rootDir>/src/errors/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@cache/(.*)$': '<rootDir>/src/cache/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@validates/(.*)$': '<rootDir>/src/validates/$1',
    '^@tracing/(.*)$': '<rootDir>/src/tracing/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1'
  }
};
