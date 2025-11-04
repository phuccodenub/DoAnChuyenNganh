// Jest global env setup for backend tests
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DB_DIALECT = process.env.DB_DIALECT || 'sqlite';
process.env.SQLITE = process.env.SQLITE || 'true';
process.env.SQLITE_PATH = process.env.SQLITE_PATH || ':memory:';
process.env.DISABLE_METRICS = 'true';
process.env.DISABLE_CACHE = 'true';
process.env.RATE_LIMIT_DISABLED = 'true';
// Avoid noisy logs during tests
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error';

