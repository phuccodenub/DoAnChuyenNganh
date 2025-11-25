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

// Provide safe defaults for Google Drive in tests so GoogleDriveService can be constructed
// These are dummy values used ONLY in Jest environment; real credentials are required in production
setDefault('GOOGLE_CLIENT_ID', 'test-google-client-id');
setDefault('GOOGLE_CLIENT_SECRET', 'test-google-client-secret');
setDefault('GOOGLE_REDIRECT_URI', 'http://localhost/test-google-redirect');
setDefault('GOOGLE_REFRESH_TOKEN', 'test-google-refresh-token');
setDefault('GDRIVE_RESOURCES_FOLDER_ID', 'test-resources-folder-id');
setDefault('GDRIVE_LIVE_RAW_FOLDER_ID', 'test-live-raw-folder-id');
setDefault('GDRIVE_BACKUP_FOLDER_ID', 'test-backup-folder-id');

