const setDefault = (key: string, value: string): void => {
  if (typeof process.env[key] === 'undefined') {
    process.env[key] = value;
  }
};

const isIntegrationCategory = process.env.TEST_CATEGORY === 'integration';

setDefault('NODE_ENV', 'test');

if (isIntegrationCategory) {
  setDefault('DB_DIALECT', 'postgres');
  if (typeof process.env.SQLITE === 'undefined') {
    process.env.SQLITE = 'false';
  }
  if (process.env.SQLITE_PATH === ':memory:') {
    delete process.env.SQLITE_PATH;
  }
  setDefault('DISABLE_METRICS', 'false');
} else {
  setDefault('DB_DIALECT', 'sqlite');
  setDefault('SQLITE', 'true');
  setDefault('SQLITE_PATH', ':memory:');
  setDefault('DISABLE_METRICS', 'true');
}

setDefault('DISABLE_CACHE', 'true');
setDefault('RATE_LIMIT_DISABLED', 'true');
setDefault('LOG_LEVEL', 'error');

