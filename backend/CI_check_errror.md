Run npm run test:e2e

> backend@1.0.0 test:e2e
> cross-env TEST_CATEGORY=integration E2E_SUITE=true jest --config jest.config.js --testPathPatterns=e2e --detectOpenHandles --runInBand

FAIL src/tests/e2e/course-enrollment.e2e.test.ts (15.132 s)
  ● Console

    console.warn
      [dotenv-flow@4.1.0]: ".env*" files loading failed: no ".env*" files matching pattern ".env[.test][.local]" in "/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend" dir undefined

      4 |  */
      5 |
    > 6 | import 'dotenv-flow/config';
        | ^
      7 | import path from 'path';
      8 | import dotenv from 'dotenv';
      9 | import { applySequelizeSqlShim } from './utils/test.utils';

      at warn (node_modules/dotenv-flow/lib/dotenv-flow.js:394:11)
      at failure (node_modules/dotenv-flow/lib/dotenv-flow.js:383:5)
      at Object.config (node_modules/dotenv-flow/lib/dotenv-flow.js:359:16)
      at Object.<anonymous> (node_modules/dotenv-flow/config.js:6:30)
      at Object.<anonymous> (src/tests/setup.ts:6:1)

    console.log
      [dotenv@17.2.3] injecting env (25) from src/tests/integration/test.env -- tip: ⚙️  specify custom .env file path with { path: '/custom/path/.env' }

      at _log (node_modules/dotenv/lib/main.js:142:11)

    console.log
      [API_ROUTE_DEBUG_COUNT] 4

      at Object.<anonymous> (src/app.ts:150:11)

    console.log
      [API_ROUTE_DEBUG_LIST] [
        'GET /users/profile',
        'PUT /users/profile',
        'PUT /users/change-password',
        'GET /__routes_debug'
      ]

      at Object.<anonymous> (src/app.ts:152:11)

    console.log
      OpenTelemetry tracing started (local only, no OTLP export)

      at log (src/tracing/tracing.ts:45:15)

    console.error
      [SQL_SHIM_ERROR] default connect ECONNREFUSED 127.0.0.1:6543 SELECT 1+1 AS result

      126 |         .catch((err: any) => {
      127 |         // eslint-disable-next-line no-console
    > 128 |         console.error('[SQL_SHIM_ERROR] default', err?.message, typeof sqlText === 'string' ? sqlText : '<<non-string-sql>>');
          |                 ^
      129 |         throw err;
      130 |       });
      131 |     };

      at src/tests/utils/test.utils.ts:128:17
      at Sequelize.authenticate (node_modules/sequelize/src/sequelize.js:972:5)
      at Object.<anonymous> (src/tests/setup.ts:103:9)

    console.error
      [SQL_SHIM_ERROR] default connect ECONNREFUSED 127.0.0.1:6543 TRUNCATE TABLE enrollments RESTART IDENTITY CASCADE

      126 |         .catch((err: any) => {
      127 |         // eslint-disable-next-line no-console
    > 128 |         console.error('[SQL_SHIM_ERROR] default', err?.message, typeof sqlText === 'string' ? sqlText : '<<non-string-sql>>');
          |                 ^
      129 |         throw err;
      130 |       });
      131 |     };

      at src/tests/utils/test.utils.ts:128:17
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:64:5)

  ● Course Enrollment E2E › POST /api/v1/enrollments › should enroll in course successfully

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › POST /api/v1/enrollments › should enroll in course successfully

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › POST /api/v1/enrollments › should fail to enroll without authentication

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › POST /api/v1/enrollments › should fail to enroll without authentication

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › POST /api/v1/enrollments › should fail to enroll in non-existent course

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › POST /api/v1/enrollments › should fail to enroll in non-existent course

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › POST /api/v1/enrollments › should fail to enroll twice in same course

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › POST /api/v1/enrollments › should fail to enroll twice in same course

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › GET /api/v1/enrollments › should get user enrollments

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › GET /api/v1/enrollments › should get user enrollments

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › GET /api/v1/enrollments › should get enrollments with pagination

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › GET /api/v1/enrollments › should get enrollments with pagination

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › GET /api/v1/enrollments › should filter enrollments by status

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › GET /api/v1/enrollments › should filter enrollments by status

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › GET /api/v1/enrollments/:id › should get enrollment by ID

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › GET /api/v1/enrollments/:id › should get enrollment by ID

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › GET /api/v1/enrollments/:id › should return 404 for non-existent enrollment

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › GET /api/v1/enrollments/:id › should return 404 for non-existent enrollment

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › PUT /api/v1/enrollments/:id/progress › should update enrollment progress

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › PUT /api/v1/enrollments/:id/progress › should update enrollment progress

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › PUT /api/v1/enrollments/:id/progress › should fail to update progress without authentication

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › PUT /api/v1/enrollments/:id/progress › should fail to update progress without authentication

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › PUT /api/v1/enrollments/:id/complete › should complete enrollment successfully

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › PUT /api/v1/enrollments/:id/complete › should complete enrollment successfully

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › PUT /api/v1/enrollments/:id/complete › should fail to complete enrollment without authentication

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › PUT /api/v1/enrollments/:id/complete › should fail to complete enrollment without authentication

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › DELETE /api/v1/enrollments/:id › should drop enrollment successfully

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › DELETE /api/v1/enrollments/:id › should drop enrollment successfully

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › DELETE /api/v1/enrollments/:id › should return 404 when dropping non-existent enrollment

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › DELETE /api/v1/enrollments/:id › should return 404 when dropping non-existent enrollment

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › GET /api/v1/courses/:id/enrollments › should get course enrollments (instructor only)

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › GET /api/v1/courses/:id/enrollments › should get course enrollments (instructor only)

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › GET /api/v1/users/:id/enrollments › should get user enrollment history

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Enrollment E2E › GET /api/v1/users/:id/enrollments › should get user enrollment history

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

FAIL src/tests/e2e/course-registration.e2e.test.ts
  ● Console

    console.warn
      [dotenv-flow@4.1.0]: ".env*" files loading failed: no ".env*" files matching pattern ".env[.test][.local]" in "/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend" dir undefined

      4 |  */
      5 |
    > 6 | import 'dotenv-flow/config';
        | ^
      7 | import path from 'path';
      8 | import dotenv from 'dotenv';
      9 | import { applySequelizeSqlShim } from './utils/test.utils';

      at warn (node_modules/dotenv-flow/lib/dotenv-flow.js:394:11)
      at failure (node_modules/dotenv-flow/lib/dotenv-flow.js:383:5)
      at Object.config (node_modules/dotenv-flow/lib/dotenv-flow.js:359:16)
      at Object.<anonymous> (node_modules/dotenv-flow/config.js:6:30)
      at Object.<anonymous> (src/tests/setup.ts:6:1)

    console.log
      [dotenv@17.2.3] injecting env (25) from src/tests/integration/test.env -- tip: ⚙️  override existing env vars with { override: true }

      at _log (node_modules/dotenv/lib/main.js:142:11)

    console.log
      [API_ROUTE_DEBUG_COUNT] 4

      at Object.<anonymous> (src/app.ts:150:11)

    console.log
      [API_ROUTE_DEBUG_LIST] [
        'GET /users/profile',
        'PUT /users/profile',
        'PUT /users/change-password',
        'GET /__routes_debug'
      ]

      at Object.<anonymous> (src/app.ts:152:11)

    console.log
      OpenTelemetry tracing started (local only, no OTLP export)

      at log (src/tracing/tracing.ts:45:15)

    console.error
      [SQL_SHIM_ERROR] default connect ECONNREFUSED 127.0.0.1:6543 SELECT 1+1 AS result

      126 |         .catch((err: any) => {
      127 |         // eslint-disable-next-line no-console
    > 128 |         console.error('[SQL_SHIM_ERROR] default', err?.message, typeof sqlText === 'string' ? sqlText : '<<non-string-sql>>');
          |                 ^
      129 |         throw err;
      130 |       });
      131 |     };

      at src/tests/utils/test.utils.ts:128:17
      at Sequelize.authenticate (node_modules/sequelize/src/sequelize.js:972:5)
      at Object.<anonymous> (src/tests/setup.ts:103:9)

    console.error
      [SQL_SHIM_ERROR] default connect ECONNREFUSED 127.0.0.1:6543 TRUNCATE TABLE courses RESTART IDENTITY CASCADE

      126 |         .catch((err: any) => {
      127 |         // eslint-disable-next-line no-console
    > 128 |         console.error('[SQL_SHIM_ERROR] default', err?.message, typeof sqlText === 'string' ? sqlText : '<<non-string-sql>>');
          |                 ^
      129 |         throw err;
      130 |       });
      131 |     };

      at src/tests/utils/test.utils.ts:128:17
      at Object.<anonymous> (src/tests/e2e/course-registration.e2e.test.ts:26:5)

  ● Course Registration E2E › POST /api/v1/courses › should create a new course successfully

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › POST /api/v1/courses › should create a new course successfully

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › POST /api/v1/courses › should fail to create course without authentication

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › POST /api/v1/courses › should fail to create course without authentication

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › POST /api/v1/courses › should fail to create course with invalid data

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › POST /api/v1/courses › should fail to create course with invalid data

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › GET /api/v1/courses › should get all courses

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › GET /api/v1/courses › should get all courses

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › GET /api/v1/courses › should get courses with pagination

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › GET /api/v1/courses › should get courses with pagination

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › GET /api/v1/courses › should filter courses by category

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › GET /api/v1/courses › should filter courses by category

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › GET /api/v1/courses/:id › should get course by ID

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › GET /api/v1/courses/:id › should get course by ID

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › GET /api/v1/courses/:id › should return 404 for non-existent course

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › GET /api/v1/courses/:id › should return 404 for non-existent course

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › PUT /api/v1/courses/:id › should update course successfully

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › PUT /api/v1/courses/:id › should update course successfully

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › PUT /api/v1/courses/:id › should fail to update course without authentication

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › PUT /api/v1/courses/:id › should fail to update course without authentication

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › DELETE /api/v1/courses/:id › should delete course successfully

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › DELETE /api/v1/courses/:id › should delete course successfully

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › DELETE /api/v1/courses/:id › should return 404 when deleting non-existent course

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● Course Registration E2E › DELETE /api/v1/courses/:id › should return 404 when deleting non-existent course

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

FAIL src/tests/e2e/health.e2e.test.ts
  ● Console

    console.warn
      [dotenv-flow@4.1.0]: ".env*" files loading failed: no ".env*" files matching pattern ".env[.test][.local]" in "/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend" dir undefined

      4 |  */
      5 |
    > 6 | import 'dotenv-flow/config';
        | ^
      7 | import path from 'path';
      8 | import dotenv from 'dotenv';
      9 | import { applySequelizeSqlShim } from './utils/test.utils';

      at warn (node_modules/dotenv-flow/lib/dotenv-flow.js:394:11)
      at failure (node_modules/dotenv-flow/lib/dotenv-flow.js:383:5)
      at Object.config (node_modules/dotenv-flow/lib/dotenv-flow.js:359:16)
      at Object.<anonymous> (node_modules/dotenv-flow/config.js:6:30)
      at Object.<anonymous> (src/tests/setup.ts:6:1)

    console.log
      [dotenv@17.2.3] injecting env (25) from src/tests/integration/test.env -- tip: 🗂️ backup and recover secrets: https://dotenvx.com/ops

      at _log (node_modules/dotenv/lib/main.js:142:11)

    console.log
      [API_ROUTE_DEBUG_COUNT] 4

      at Object.<anonymous> (src/app.ts:150:11)

    console.log
      [API_ROUTE_DEBUG_LIST] [
        'GET /users/profile',
        'PUT /users/profile',
        'PUT /users/change-password',
        'GET /__routes_debug'
      ]

      at Object.<anonymous> (src/app.ts:152:11)

    console.log
      OpenTelemetry tracing started (local only, no OTLP export)

      at log (src/tracing/tracing.ts:45:15)

    console.error
      [SQL_SHIM_ERROR] default connect ECONNREFUSED 127.0.0.1:6543 SELECT 1+1 AS result

      126 |         .catch((err: any) => {
      127 |         // eslint-disable-next-line no-console
    > 128 |         console.error('[SQL_SHIM_ERROR] default', err?.message, typeof sqlText === 'string' ? sqlText : '<<non-string-sql>>');
          |                 ^
      129 |         throw err;
      130 |       });
      131 |     };

      at src/tests/utils/test.utils.ts:128:17
      at Sequelize.authenticate (node_modules/sequelize/src/sequelize.js:972:5)
      at Object.<anonymous> (src/tests/setup.ts:103:9)

  ● E2E: Health endpoints › GET /ping should return 200 and plain text pong

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● E2E: Health endpoints › GET /health should return overall health

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● E2E: Health endpoints › GET /health/ready should return readiness

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● E2E: Health endpoints › GET /health/database should return db health payload

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

FAIL src/tests/e2e/metrics.e2e.test.ts
  ● Console

    console.warn
      [dotenv-flow@4.1.0]: ".env*" files loading failed: no ".env*" files matching pattern ".env[.test][.local]" in "/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend" dir undefined

      4 |  */
      5 |
    > 6 | import 'dotenv-flow/config';
        | ^
      7 | import path from 'path';
      8 | import dotenv from 'dotenv';
      9 | import { applySequelizeSqlShim } from './utils/test.utils';

      at warn (node_modules/dotenv-flow/lib/dotenv-flow.js:394:11)
      at failure (node_modules/dotenv-flow/lib/dotenv-flow.js:383:5)
      at Object.config (node_modules/dotenv-flow/lib/dotenv-flow.js:359:16)
      at Object.<anonymous> (node_modules/dotenv-flow/config.js:6:30)
      at Object.<anonymous> (src/tests/setup.ts:6:1)

    console.log
      [dotenv@17.2.3] injecting env (25) from src/tests/integration/test.env -- tip: ⚙️  suppress all logs with { quiet: true }

      at _log (node_modules/dotenv/lib/main.js:142:11)

    console.log
      [API_ROUTE_DEBUG_COUNT] 4

      at Object.<anonymous> (src/app.ts:150:11)

    console.log
      [API_ROUTE_DEBUG_LIST] [
        'GET /users/profile',
        'PUT /users/profile',
        'PUT /users/change-password',
        'GET /__routes_debug'
      ]

      at Object.<anonymous> (src/app.ts:152:11)

    console.log
      OpenTelemetry tracing started (local only, no OTLP export)

      at log (src/tracing/tracing.ts:45:15)

    console.error
      [SQL_SHIM_ERROR] default connect ECONNREFUSED 127.0.0.1:6543 SELECT 1+1 AS result

      126 |         .catch((err: any) => {
      127 |         // eslint-disable-next-line no-console
    > 128 |         console.error('[SQL_SHIM_ERROR] default', err?.message, typeof sqlText === 'string' ? sqlText : '<<non-string-sql>>');
          |                 ^
      129 |         throw err;
      130 |       });
      131 |     };

      at src/tests/utils/test.utils.ts:128:17
      at Sequelize.authenticate (node_modules/sequelize/src/sequelize.js:972:5)
      at Object.<anonymous> (src/tests/setup.ts:103:9)

  ● E2E: Metrics endpoints › GET /metrics/prometheus should return text/plain and include baseline metrics

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

  ● E2E: Metrics endpoints › GET /metrics should return json with success

    SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:6543

      at Client._connectionCallback (node_modules/sequelize/src/dialects/postgres/connection-manager.js:184:24)
      at Client._handleErrorWhileConnecting (node_modules/pg/lib/client.js:336:19)
      at Client._handleErrorEvent (node_modules/pg/lib/client.js:346:19)
      at Socket.reportStreamError (node_modules/pg/lib/connection.js:57:12)

-----------------------------------|---------|----------|---------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------
File                               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                                                                                                                                        
-----------------------------------|---------|----------|---------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------
All files                          |   13.72 |     2.71 |    4.65 |    13.6 |                                                                                                                                                          
 api                               |   59.64 |        0 |   14.28 |   62.26 |                                                                                                                                                          
  index.ts                         |     100 |      100 |     100 |     100 |                                                                                                                                                          
  routes.ts                        |   55.76 |        0 |       0 |   59.18 | 34-52,73-87                                                                                                                                              
 api/v1                            |     100 |      100 |     100 |     100 |                                                                                                                                                          
  index.ts                         |     100 |      100 |     100 |     100 |                                                                                                                                                          
 api/v1/routes                     |    94.8 |      100 |       0 |     100 |                                                                                                                                                          
  assignment.routes.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                          
  auth.routes.ts                   |     100 |      100 |     100 |     100 |                                                                                                                                                          
  course.routes.ts                 |     100 |      100 |     100 |     100 |                                                                                                                                                          
  enrollment.routes.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                          
  index.ts                         |   94.11 |      100 |       0 |     100 |                                                                                                                                                          
  lesson.routes.ts                 |     100 |      100 |     100 |     100 |                                                                                                                                                          
  quiz.routes.ts                   |     100 |      100 |     100 |     100 |                                                                                                                                                          
  section.routes.ts                |     100 |      100 |     100 |     100 |                                                                                                                                                          
  user.routes.ts                   |   88.88 |      100 |       0 |     100 |                                                                                                                                                          
 api/v2                            |     100 |      100 |     100 |     100 |                                                                                                                                                          
  index.ts                         |     100 |      100 |     100 |     100 |                                                                                                                                                          
 api/v2/routes                     |      84 |      100 |       0 |      84 |                                                                                                                                                          
  auth.routes.ts                   |   77.77 |      100 |       0 |   77.77 | 16,27                                                                                                                                                    
  index.ts                         |     100 |      100 |     100 |     100 |                                                                                                                                                          
  user.routes.ts                   |   77.77 |      100 |       0 |   77.77 | 16,27                                                                                                                                                    
 api/versioning                    |   27.56 |     6.75 |   18.75 |   25.87 |                                                                                                                                                          
  index.ts                         |     100 |      100 |   33.33 |     100 |                                                                                                                                                          
  version.config.ts                |     100 |      100 |     100 |     100 |                                                                                                                                                          
  version.manager.ts               |   11.71 |     4.16 |      12 |   12.39 | 42,46,52,74-205,212-249,261-287,295-323,335-393                                                                                                          
  version.routes.ts                |     100 |      100 |     100 |     100 |                                                                                                                                                          
 cache                             |    2.92 |     0.57 |       0 |    2.33 |                                                                                                                                                          
  cache-configuration.manager.ts   |       0 |        0 |       0 |       0 | 6-546                                                                                                                                                    
  cache-invalidation.manager.ts    |       0 |        0 |       0 |       0 | 6-560                                                                                                                                                    
  cache-performance.analyzer.ts    |       0 |        0 |       0 |       0 | 6-343                                                                                                                                                    
  cache.manager.ts                 |    2.73 |        0 |       0 |    2.79 | 27-475                                                                                                                                                   
  cache.middleware.ts              |    5.66 |      2.4 |       0 |    5.84 | 25-357,368-371,375                                                                                                                                       
  cache.routes.ts                  |       0 |      100 |       0 |       0 | 6-492                                                                                                                                                    
  enhanced-cache.middleware.ts     |       0 |        0 |       0 |       0 | 8-431                                                                                                                                                    
  index.ts                         |     100 |      100 |       0 |     100 |                                                                                                                                                          
 cache/strategies                  |    1.78 |        0 |       0 |    1.84 |                                                                                                                                                          
  hybrid.strategy.ts               |    2.56 |        0 |       0 |    2.68 | 26-423                                                                                                                                                   
  memory.strategy.ts               |    1.03 |        0 |       0 |    1.05 | 17-496                                                                                                                                                   
  redis.strategy.ts                |    1.94 |        0 |       0 |    2.01 | 11-397                                                                                                                                                   
 config                            |   36.11 |       50 |   29.62 |    34.3 |                                                                                                                                                          
  cors.config.ts                   |      60 |        0 |       0 |    62.5 | 7-10                                                                                                                                                     
  db.ts                            |   36.58 |    26.53 |      25 |   35.89 | 20-25,52-73,80-103                                                                                                                                       
  env.config.ts                    |     100 |    76.47 |     100 |     100 | 8,17-42                                                                                                                                                  
  index.ts                         |       0 |      100 |     100 |       0 | 2-5                                                                                                                                                      
  jwt.config.ts                    |     100 |       90 |       0 |     100 | 3                                                                                                                                                        
  mail.config.ts                   |       0 |        0 |       0 |       0 | 1-106                                                                                                                                                    
  redis.config.ts                  |    28.2 |    66.66 |       0 |    28.2 | 13,20,24,28,33-38,45-81                                                                                                                                  
  swagger.config.ts                |     100 |      100 |     100 |     100 |                                                                                                                                                          
 constants                         |   95.16 |    89.28 |     100 |   95.16 |                                                                                                                                                          
  app.constants.ts                 |     100 |       50 |     100 |     100 | 66-73                                                                                                                                                    
  response.constants.ts            |     100 |      100 |     100 |     100 |                                                                                                                                                          
  roles.enum.ts                    |     100 |      100 |     100 |     100 |                                                                                                                                                          
  user.constants.ts                |       0 |      100 |     100 |       0 | 2-65                                                                                                                                                     
 errors                            |    7.74 |        0 |       0 |    8.81 |                                                                                                                                                          
  api.error.ts                     |    6.89 |        0 |       0 |       8 | 27-198                                                                                                                                                   
  authentication.error.ts          |    5.71 |        0 |       0 |    7.14 | 42-203                                                                                                                                                   
  authorization.error.ts           |    5.55 |        0 |       0 |    7.14 | 32-188                                                                                                                                                   
  base.error.ts                    |    3.33 |        0 |       0 |    3.33 | 44-162                                                                                                                                                   
  database.error.ts                |    3.27 |        0 |       0 |    4.08 | 45-289                                                                                                                                                   
  error.constants.ts               |       0 |      100 |     100 |       0 | 7-151                                                                                                                                                    
  error.factory.ts                 |   11.25 |        0 |       0 |   11.25 | 26-306                                                                                                                                                   
  error.handler.ts                 |   26.47 |        0 |       0 |   26.47 | 32-221                                                                                                                                                   
  error.utils.ts                   |    2.63 |        0 |       0 |    2.66 | 14-275                                                                                                                                                   
  external-service.error.ts        |       4 |        0 |       0 |    4.87 | 47-238                                                                                                                                                   
  file.error.ts                    |    5.55 |        0 |       0 |    7.14 | 45-211                                                                                                                                                   
  index.ts                         |       0 |      100 |       0 |       0 | 7-29                                                                                                                                                     
  validation.error.ts              |    5.71 |        0 |       0 |    6.89 | 46-185                                                                                                                                                   
 middlewares                       |   21.75 |     3.57 |   13.63 |      19 |                                                                                                                                                          
  auth-rate-limit.middleware.ts    |   58.33 |    30.76 |       0 |   63.63 | 7,26-28                                                                                                                                                  
  auth.middleware.ts               |    20.4 |        0 |      25 |   15.21 | 18-51,65-91,97-115                                                                                                                                       
  error.middleware.ts              |   55.55 |        0 |       0 |   55.55 | 20-24                                                                                                                                                    
  logger.middleware.ts             |   27.77 |        0 |       0 |   18.75 | 6-33,38-50                                                                                                                                               
  tracing.middleware.ts            |   15.78 |        0 |       0 |   15.78 | 6-56,61-67,71-72,77-78                                                                                                                                   
  uuid-validation.middleware.ts    |       0 |        0 |       0 |       0 | 3-66                                                                                                                                                     
  validate-dto.middleware.ts       |       0 |        0 |       0 |       0 | 2-118                                                                                                                                                    
  validate.middleware.ts           |   34.54 |        0 |   38.46 |   29.16 | 14-69,88-103,117-126                                                                                                                                     
 models                            |   42.53 |     1.42 |    6.32 |   40.63 |                                                                                                                                                          
  assignment-submission.model.ts   |     100 |      100 |     100 |     100 |                                                                                                                                                          
  assignment.model.ts              |     100 |      100 |     100 |     100 |                                                                                                                                                          
  associations-extended.ts         |       0 |      100 |       0 |       0 | 8-343                                                                                                                                                    
  associations.ts                  |       0 |      100 |       0 |       0 | 6-266                                                                                                                                                    
  category.model.ts                |   47.05 |        0 |       0 |   47.05 | 108,115-163                                                                                                                                              
  chat-message.model.ts            |    87.5 |      100 |       0 |    87.5 | 85                                                                                                                                                       
  course-statistics.model.ts       |     100 |      100 |     100 |     100 |                                                                                                                                                          
  course.model.ts                  |   55.55 |        0 |       0 |   55.55 | 67-129                                                                                                                                                   
  enrollment.model.ts              |     100 |      100 |     100 |     100 |                                                                                                                                                          
  final-grade.model.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                          
  grade-component.model.ts         |     100 |      100 |     100 |     100 |                                                                                                                                                          
  grade.model.ts                   |     100 |      100 |     100 |     100 |                                                                                                                                                          
  index.ts                         |    98.5 |       50 |      20 |   97.67 | 54                                                                                                                                                       
  lesson-material.model.ts         |      40 |        0 |       0 |    42.1 | 109-117,124-142                                                                                                                                          
  lesson-progress.model.ts         |   20.51 |        0 |       0 |   21.62 | 128-158,165-219                                                                                                                                          
  lesson.model.ts                  |   25.92 |        0 |       0 |   25.92 | 121-134,140-170                                                                                                                                          
  live-session-attendance.model.ts |     100 |      100 |     100 |     100 |                                                                                                                                                          
  live-session.model.ts            |     100 |      100 |     100 |     100 |                                                                                                                                                          
  notification-recipient.model.ts  |   16.12 |        0 |       0 |   17.54 | 118-156,179-288                                                                                                                                          
  notification.model.ts            |   38.09 |        0 |       0 |   38.09 | 145-161,168-212                                                                                                                                          
  password-reset-token.model.ts    |       0 |        0 |       0 |       0 | 1-119                                                                                                                                                    
  quiz-answer.model.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                          
  quiz-attempt.model.ts            |     100 |      100 |     100 |     100 |                                                                                                                                                          
  quiz-option.model.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                          
  quiz-question.model.ts           |     100 |      100 |     100 |     100 |                                                                                                                                                          
  quiz.model.ts                    |     100 |      100 |     100 |     100 |                                                                                                                                                          
  section.model.ts                 |      28 |        0 |       0 |      28 | 86-99,106-133                                                                                                                                            
  user-activity-log.model.ts       |     100 |      100 |     100 |     100 |                                                                                                                                                          
  user.model.ts                    |     100 |      100 |     100 |     100 |                                                                                                                                                          
 modules/analytics                 |      48 |        0 |   15.38 |   53.33 |                                                                                                                                                          
  analytics.controller.ts          |   35.29 |        0 |   33.33 |   35.29 | 13-18,23-29                                                                                                                                              
  analytics.repository.ts          |      50 |        0 |       0 |      50 | 5-9                                                                                                                                                      
  analytics.routes.ts              |     100 |      100 |     100 |     100 |                                                                                                                                                          
  analytics.service.ts             |      60 |        0 |   33.33 |      60 | 11-15                                                                                                                                                    
  analytics.validate.ts            |     100 |      100 |     100 |     100 |                                                                                                                                                          
  index.ts                         |       0 |      100 |       0 |       0 | 2-7                                                                                                                                                      
 modules/assignment                |   12.67 |        0 |    5.88 |   13.09 |                                                                                                                                                          
  assignment.controller.ts         |   14.28 |        0 |      10 |   14.28 | 16-22,27-33,38-44,49-165                                                                                                                                 
  assignment.repository.ts         |    12.5 |        0 |    6.66 |    12.9 | 21-223                                                                                                                                                   
  assignment.routes.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                          
  assignment.service.ts            |    3.92 |        0 |    5.26 |       4 | 21-319                                                                                                                                                   
  assignment.validate.ts           |      50 |        0 |       0 |      50 | 6-7                                                                                                                                                      
  index.ts                         |       0 |      100 |       0 |       0 | 2-7                                                                                                                                                      
 modules/auth                      |    8.78 |        0 |    4.59 |    8.27 |                                                                                                                                                          
  auth.controller.ts               |    6.25 |        0 |    8.33 |    6.25 | 17-187                                                                                                                                                   
  auth.repository.ts               |    2.74 |        0 |    4.54 |    2.74 | 17-469                                                                                                                                                   
  auth.routes.ts                   |    64.7 |      100 |       0 |    64.7 | 19,27,35,42,49,55,66,72,79,87,94,101                                                                                                                     
  auth.service.ts                  |    3.97 |        0 |    9.09 |    3.97 | 25-445                                                                                                                                                   
  auth.validate.ts                 |       0 |        0 |       0 |       0 | 1-450                                                                                                                                                    
  index.ts                         |     100 |      100 |   33.33 |     100 |                                                                                                                                                          
 modules/category                  |   36.45 |        0 |   13.04 |   39.77 |                                                                                                                                                          
  category.controller.ts           |   27.02 |        0 |   16.66 |   27.77 | 13-19,24-30,35-39,44-49,54-59                                                                                                                            
  category.repository.ts           |      25 |        0 |      20 |   27.77 | 14-43                                                                                                                                                    
  category.routes.ts               |     100 |      100 |     100 |     100 |                                                                                                                                                          
  category.service.ts              |   33.33 |        0 |   14.28 |   33.33 | 14-49                                                                                                                                                    
  category.validate.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                          
  index.ts                         |       0 |      100 |       0 |       0 | 1-6                                                                                                                                                      
 modules/chat                      |       0 |        0 |       0 |       0 |                                                                                                                                                          
  chat.controller.ts               |       0 |        0 |       0 |       0 | 7-179                                                                                                                                                    
  chat.gateway.ts                  |       0 |        0 |       0 |       0 | 7-488                                                                                                                                                    
  chat.repository.ts               |       0 |        0 |       0 |       0 | 6-385                                                                                                                                                    
  chat.routes.ts                   |       0 |      100 |     100 |       0 | 6-65                                                                                                                                                     
  chat.service.ts                  |       0 |        0 |       0 |       0 | 6-176                                                                                                                                                    
  chat.types.ts                    |       0 |        0 |       0 |       0 | 152-192                                                                                                                                                  
  index.ts                         |       0 |      100 |       0 |       0 | 6-11                                                                                                                                                     
 modules/course                    |   13.33 |        0 |    4.54 |   13.68 |                                                                                                                                                          
  course.controller.ts             |   16.83 |        0 |    9.09 |   16.83 | 20-30,36-62,68-78,84-99,105-120,126-146,152-175,181-197,203-218,224-240                                                                                  
  course.repository.ts             |    6.25 |        0 |    4.16 |    6.42 | 21-353                                                                                                                                                   
  course.routes.ts                 |     100 |      100 |     100 |     100 |                                                                                                                                                          
  course.service.ts                |     5.4 |        0 |    9.09 |     5.4 | 22-259                                                                                                                                                   
  course.validate.ts               |       0 |        0 |       0 |       0 | 1-231                                                                                                                                                    
  index.ts                         |       0 |      100 |       0 |       0 | 7-53                                                                                                                                                     
 modules/course-content            |   13.69 |        0 |    3.44 |    14.1 |                                                                                                                                                          
  course-content.controller.ts     |   15.78 |        0 |    4.76 |   15.78 | 26-40,49-66,75-86,95-108,117-129,138-151,164-178,187-199,208-221,230-242,251-264,277-291,300-312,321-332,345-358,367-379,388-400,409-421,430-442,455-472 
  course-content.repository.ts     |     3.3 |        0 |    3.03 |    3.57 | 51-432                                                                                                                                                   
  course-content.routes.ts         |     100 |      100 |     100 |     100 |                                                                                                                                                          
  course-content.service.ts        |    3.61 |        0 |    3.57 |    3.61 | 32-476                                                                                                                                                   
  course-content.validate.ts       |     100 |      100 |     100 |     100 |                                                                                                                                                          
  index.ts                         |       0 |      100 |       0 |       0 | 2-7                                                                                                                                                      
 modules/enrollment                |   10.58 |        0 |     3.7 |   10.98 |                                                                                                                                                          
  enrollment.controller.ts         |    4.23 |        0 |    5.88 |    4.23 | 20-299                                                                                                                                                   
  enrollment.repository.ts         |    5.22 |        0 |       4 |    5.78 | 20-367                                                                                                                                                   
  enrollment.routes.ts             |    62.5 |      100 |       0 |    62.5 | 21,28,35,44,52,60,69,78,87,94,102,110,119,127,134                                                                                                        
  enrollment.service.ts            |    4.92 |        0 |    5.26 |    5.03 | 7-8,30-351                                                                                                                                               
  enrollment.validate.ts           |      30 |        0 |       0 |      30 | 28-130                                                                                                                                                   
 modules/files                     |       0 |        0 |       0 |       0 |                                                                                                                                                          
  files.controller.ts              |       0 |        0 |       0 |       0 | 8-259                                                                                                                                                    
  files.routes.ts                  |       0 |      100 |     100 |       0 | 6-80                                                                                                                                                     
  files.service.ts                 |       0 |        0 |       0 |       0 | 6-452                                                                                                                                                    
  files.types.ts                   |       0 |        0 |       0 |       0 | 78-183                                                                                                                                                   
  index.ts                         |       0 |      100 |       0 |       0 | 6-10                                                                                                                                                     
  upload.middleware.ts             |       0 |        0 |       0 |       0 | 6-230                                                                                                                                                    
 modules/grade                     |   14.41 |        0 |    5.88 |   15.16 |                                                                                                                                                          
  grade.controller.ts              |   31.81 |      100 |      25 |   31.81 | 13-18,23-28,33-38                                                                                                                                        
  grade.repository.ts              |    9.75 |        0 |    4.16 |      10 | 23-110                                                                                                                                                   
  grade.routes.ts                  |     100 |      100 |     100 |     100 |                                                                                                                                                          
  grade.service.ts                 |    4.51 |        0 |    5.55 |    4.68 | 20-293                                                                                                                                                   
  grade.validate.ts                |     100 |      100 |     100 |     100 |                                                                                                                                                          
  index.ts                         |       0 |      100 |       0 |       0 | 2-7                                                                                                                                                      
 modules/lesson                    |   25.56 |        0 |   13.63 |   26.15 |                                                                                                                                                          
  lesson.controller.ts             |   15.38 |        0 |   16.66 |   15.38 | 18-121                                                                                                                                                   
  lesson.repository.ts             |      25 |        0 |   33.33 |   29.41 | 13-53                                                                                                                                                    
  lesson.routes.ts                 |      75 |      100 |       0 |      75 | 20,27,35,44,52                                                                                                                                           
  lesson.service.ts                |      12 |        0 |   16.66 |      12 | 23-115                                                                                                                                                   
  lesson.validate.ts               |      50 |        0 |       0 |      50 | 6-7                                                                                                                                                      
 modules/livestream                |   38.66 |        0 |   10.52 |   42.02 |                                                                                                                                                          
  index.ts                         |       0 |      100 |       0 |       0 | 2-7                                                                                                                                                      
  livestream.controller.ts         |   27.58 |      100 |      20 |   27.58 | 13-18,23-28,33-38,43-49                                                                                                                                  
  livestream.repository.ts         |      20 |        0 |       0 |   22.22 | 11-38                                                                                                                                                    
  livestream.routes.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                          
  livestream.service.ts            |   33.33 |        0 |      20 |   33.33 | 14-37                                                                                                                                                    
  livestream.validate.ts           |     100 |      100 |     100 |     100 |                                                                                                                                                          
 modules/notifications             |    31.4 |        0 |   11.53 |   34.86 |                                                                                                                                                          
  index.ts                         |       0 |      100 |       0 |       0 | 2-7                                                                                                                                                      
  notifications.controller.ts      |   24.32 |        0 |   16.66 |   24.32 | 14-19,24-49,54-59,64-69,74-80                                                                                                                            
  notifications.repository.ts      |   21.42 |        0 |   11.11 |   25.71 | 21-130                                                                                                                                                   
  notifications.routes.ts          |     100 |      100 |     100 |     100 |                                                                                                                                                          
  notifications.service.ts         |   21.42 |        0 |   16.66 |   21.42 | 13-44                                                                                                                                                    
  notifications.validate.ts        |     100 |      100 |     100 |     100 |                                                                                                                                                          
 modules/quiz                      |     8.1 |        0 |    2.02 |    8.57 |                                                                                                                                                          
  index.ts                         |       0 |      100 |       0 |       0 | 2-7                                                                                                                                                      
  quiz.controller.ts               |       5 |        0 |    6.66 |       5 | 18-356                                                                                                                                                   
  quiz.repository.ts               |     3.7 |        0 |       0 |    4.61 | 14-372                                                                                                                                                   
  quiz.routes.ts                   |   63.15 |      100 |       0 |   63.15 | 20,27,35,44,52,61,68,77,86,94,103,111,118,125                                                                                                            
  quiz.service.ts                  |    2.39 |        0 |    2.85 |    2.45 | 21-502                                                                                                                                                   
  quiz.validate.ts                 |      40 |        0 |       0 |      40 | 6-34                                                                                                                                                     
 modules/section                   |   25.95 |        0 |   13.63 |   26.35 |                                                                                                                                                          
  section.controller.ts            |   15.38 |        0 |   16.66 |   15.38 | 18-120                                                                                                                                                   
  section.repository.ts            |   27.77 |        0 |   33.33 |   31.25 | 13-51                                                                                                                                                    
  section.routes.ts                |      75 |      100 |       0 |      75 | 20,27,35,44,52                                                                                                                                           
  section.service.ts               |      12 |        0 |   16.66 |      12 | 22-114                                                                                                                                                   
  section.validate.ts              |      50 |        0 |       0 |      50 | 6-7                                                                                                                                                      
 modules/system-settings           |       0 |        0 |       0 |       0 |                                                                                                                                                          
  system.settings.controller.ts    |       0 |        0 |       0 |       0 | 2-41                                                                                                                                                     
  system.settings.routes.ts        |       0 |      100 |       0 |       0 | 1-15                                                                                                                                                     
  system.settings.service.ts       |       0 |        0 |       0 |       0 | 1-54                                                                                                                                                     
 modules/user                      |   14.12 |        0 |    6.42 |   13.46 |                                                                                                                                                          
  index.ts                         |     100 |      100 |      60 |     100 |                                                                                                                                                          
  user.admin.controller.ts         |    8.57 |        0 |      10 |    8.57 | 32-268                                                                                                                                                   
  user.admin.routes.ts             |   65.62 |      100 |       0 |   65.62 | 29,41,53,65,77,93,106,118,131,140,149                                                                                                                    
  user.controller.ts               |     5.2 |        0 |    7.14 |     5.2 | 21-207                                                                                                                                                   
  user.repository.ts               |    2.68 |        0 |    5.26 |    2.68 | 57-485                                                                                                                                                   
  user.routes.ts                   |    57.4 |        0 |       0 |    57.4 | 24-27,43-47,57-61,68,75,81,87,95,101,106,113,119,126,133,146                                                                                             
  user.service.ts                  |    4.93 |        0 |    5.26 |    4.96 | 26-428                                                                                                                                                   
  user.validate.ts                 |       0 |        0 |       0 |       0 | 1-369                                                                                                                                                    
 modules/webrtc                    |       0 |        0 |       0 |       0 |                                                                                                                                                          
  index.ts                         |       0 |      100 |     100 |       0 | 6-8                                                                                                                                                      
  webrtc.gateway.ts                |       0 |        0 |       0 |       0 | 7-574                                                                                                                                                    
  webrtc.service.ts                |       0 |        0 |       0 |       0 | 6-152                                                                                                                                                    
  webrtc.types.ts                  |       0 |        0 |       0 |       0 | 27-166                                                                                                                                                   
 monitoring                        |   94.73 |      100 |      40 |      90 |                                                                                                                                                          
  index.ts                         |     100 |      100 |   44.44 |     100 |                                                                                                                                                          
  ping.routes.ts                   |      80 |      100 |       0 |      80 | 28                                                                                                                                                       
 monitoring/health                 |   22.35 |        0 |   11.11 |   20.95 |                                                                                                                                                          
  health.controller.ts             |   23.07 |        0 |   11.11 |   23.07 | 23-28,37-42,51-60,69-78,87-96,105-114,123-128,137-142                                                                                                    
  health.routes.ts                 |     100 |      100 |     100 |     100 |                                                                                                                                                          
  health.service.ts                |    7.07 |        0 |    6.66 |    7.07 | 131-432                                                                                                                                                  
  index.ts                         |     100 |      100 |   33.33 |     100 |                                                                                                                                                          
 monitoring/metrics                |   12.58 |     3.61 |    4.28 |   12.48 |                                                                                                                                                          
  background-tasks.metrics.ts      |       0 |        0 |       0 |       0 | 7-318                                                                                                                                                    
  database.metrics.ts              |       0 |        0 |       0 |       0 | 8-235                                                                                                                                                    
  index.ts                         |     100 |      100 |      40 |     100 |                                                                                                                                                          
  metrics.controller.ts            |   10.21 |        0 |     3.7 |   10.38 | 36-40,49-53,62-78,87-103,112-131,140-159,168-178,187-191,200-209,218-227,236-245,254-265,274-382                                                         
  metrics.middleware.ts            |   16.84 |     1.63 |    4.34 |   18.82 | 21-80,88,96,103-111,118-125,132-137,145-167,175-196,204-217,225-238,246-255                                                                              
  metrics.routes.ts                |     100 |       50 |     100 |     100 | 14-324                                                                                                                                                   
  metrics.service.ts               |   12.16 |        0 |    5.71 |   12.67 | 103-470,478,488-515                                                                                                                                      
  redis.metrics.ts                 |       0 |        0 |       0 |       0 | 8-292                                                                                                                                                    
 repositories                      |    6.76 |        0 |    3.27 |    5.03 |                                                                                                                                                          
  base.repository.ts               |     2.7 |        0 |    5.55 |     2.7 | 31-393                                                                                                                                                   
  enrollment.repository.ts         |       0 |        0 |       0 |       0 | 2-245                                                                                                                                                    
  index.ts                         |       0 |      100 |       0 |       0 | 7-40                                                                                                                                                     
  user.repository.ts               |   14.93 |        0 |    3.84 |   10.86 | 17-416                                                                                                                                                   
 routes                            |       0 |      100 |     100 |       0 |                                                                                                                                                          
  user.routes.ts                   |       0 |      100 |     100 |       0 | 9-12                                                                                                                                                     
 services/global                   |    9.78 |     0.46 |     6.4 |     8.9 |                                                                                                                                                          
  account-lockout.service.ts       |   13.95 |        0 |      20 |   14.28 | 15-94                                                                                                                                                    
  auth.service.ts                  |    12.5 |      100 |       0 |    12.5 | 10-78                                                                                                                                                    
  cache.service.ts                 |    5.74 |     5.88 |    6.25 |    6.09 | 22-184                                                                                                                                                   
  email.service.ts                 |    6.06 |        0 |   16.66 |    6.06 | 23-140                                                                                                                                                   
  file.service.ts                  |    5.71 |        0 |      20 |    5.71 | 42-136                                                                                                                                                   
  index.ts                         |   96.87 |      100 |       0 |     100 |                                                                                                                                                          
  password-security.service.ts     |   13.33 |        0 |   14.28 |   13.63 | 12-130                                                                                                                                                   
  session-management.service.ts    |    7.21 |        0 |    6.66 |    7.52 | 28-231                                                                                                                                                   
  two-factor.service.ts            |    6.77 |        0 |    9.09 |     7.2 | 17-225                                                                                                                                                   
  user-refactored.service.ts       |       0 |        0 |       0 |       0 | 1-369                                                                                                                                                    
  user.service.ts                  |    3.84 |        0 |    5.55 |    3.93 | 80-372                                                                                                                                                   
 services/media                    |       0 |        0 |       0 |       0 |                                                                                                                                                          
  cloudinary.service.ts            |       0 |        0 |       0 |       0 | 1-41                                                                                                                                                     
 services/storage                  |       0 |        0 |       0 |       0 |                                                                                                                                                          
  gcs.service.ts                   |       0 |        0 |       0 |       0 | 1-103                                                                                                                                                    
  storage.factory.ts               |       0 |        0 |       0 |       0 | 1-16                                                                                                                                                     
 shared                            |       0 |      100 |     100 |       0 |                                                                                                                                                          
  index.ts                         |       0 |      100 |     100 |       0 | 4-6                                                                                                                                                      
 shared/base                       |       0 |        0 |       0 |       0 |                                                                                                                                                          
  base.controller.ts               |       0 |        0 |       0 |       0 | 6-191                                                                                                                                                    
 swagger/paths                     |     100 |      100 |     100 |     100 |                                                                                                                                                          
  assignment.paths.ts              |     100 |      100 |     100 |     100 |                                                                                                                                                          
  auth.paths.ts                    |     100 |      100 |     100 |     100 |                                                                                                                                                          
  chat.paths.ts                    |     100 |      100 |     100 |     100 |                                                                                                                                                          
  course.paths.ts                  |     100 |      100 |     100 |     100 |                                                                                                                                                          
  enrollment.paths.ts              |     100 |      100 |     100 |     100 |                                                                                                                                                          
  grade.paths.ts                   |     100 |      100 |     100 |     100 |                                                                                                                                                          
  lesson.paths.ts                  |     100 |      100 |     100 |     100 |                                                                                                                                                          
  live-session.paths.ts            |     100 |      100 |     100 |     100 |                                                                                                                                                          
  notification.paths.ts            |     100 |      100 |     100 |     100 |                                                                                                                                                          
  quiz.paths.ts                    |     100 |      100 |     100 |     100 |                                                                                                                                                          
  section.paths.ts                 |     100 |      100 |     100 |     100 |                                                                                                                                                          
  user.paths.ts                    |     100 |      100 |     100 |     100 |                                                                                                                                                          
 swagger/schemas                   |     100 |      100 |     100 |     100 |                                                                                                                                                          
  assignment.schema.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                          
  auth.schema.ts                   |     100 |      100 |     100 |     100 |                                                                                                                                                          
  chat.schema.ts                   |     100 |      100 |     100 |     100 |                                                                                                                                                          
  course.schema.ts                 |     100 |      100 |     100 |     100 |                                                                                                                                                          
  enrollment.schema.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                          
  grade.schema.ts                  |     100 |      100 |     100 |     100 |                                                                                                                                                          
  lesson.schema.ts                 |     100 |      100 |     100 |     100 |                                                                                                                                                          
  live-session.schema.ts           |     100 |      100 |     100 |     100 |                                                                                                                                                          
  notification.schema.ts           |     100 |      100 |     100 |     100 |                                                                                                                                                          
  quiz.schema.ts                   |     100 |      100 |     100 |     100 |                                                                                                                                                          
  section.schema.ts                |     100 |      100 |     100 |     100 |                                                                                                                                                          
  user.schema.ts                   |     100 |      100 |     100 |     100 |                                                                                                                                                          
 tracing                           |   75.86 |       50 |      50 |   75.86 |                                                                                                                                                          
  tracing.ts                       |   75.86 |       50 |      50 |   75.86 | 28,43,48,54-58                                                                                                                                           
 types                             |       0 |        0 |       0 |       0 |                                                                                                                                                          
  index.ts                         |       0 |      100 |       0 |       0 | 14-78                                                                                                                                                    
  type-utilities.ts                |       0 |        0 |       0 |       0 | 18-581                                                                                                                                                   
  user.types.ts                    |       0 |        0 |       0 |       0 | 139-151                                                                                                                                                  
 types/dtos                        |       0 |        0 |       0 |       0 |                                                                                                                                                          
  enrollment.dto.ts                |       0 |        0 |       0 |       0 | 1-59                                                                                                                                                     
  index.ts                         |       0 |      100 |     100 |       0 | 6-21                                                                                                                                                     
 utils                             |   11.52 |     0.86 |    1.71 |   11.75 |                                                                                                                                                          
  bcrypt.util.ts                   |    9.52 |        0 |       0 |    9.52 | 17-130                                                                                                                                                   
  constants.util.ts                |     100 |      100 |     100 |     100 |                                                                                                                                                          
  date.util.ts                     |    0.82 |        0 |       0 |    0.82 | 20-311                                                                                                                                                   
  file.util.ts                     |    6.12 |        0 |       0 |    6.25 | 29-286                                                                                                                                                   
  hash.util.ts                     |   24.61 |        0 |       0 |   24.61 | 22-325                                                                                                                                                   
  index.ts                         |     100 |      100 |       0 |     100 |                                                                                                                                                          
  jwt.util.ts                      |    8.57 |        0 |       0 |    8.57 | 68-270                                                                                                                                                   
  logger.util.ts                   |   26.92 |     6.97 |   13.33 |   28.37 | 38-39,79-81,126-137,142-145,150,154,158,181-265                                                                                                          
  model-extension.util.ts          |   45.16 |    10.71 |   23.52 |   45.16 | 17-20,41,56,125-128,139-146,161,171,185-186,196-197,208,218-219,233-240,255,264-267                                                                      
  object.util.ts                   |    0.46 |        0 |       0 |    0.53 | 11-375                                                                                                                                                   
  pagination.util.ts               |    1.85 |        0 |       0 |    1.88 | 46-235                                                                                                                                                   
  response.util.ts                 |   26.53 |        0 |       0 |   27.08 | 18-249                                                                                                                                                   
  role.util.ts                     |    3.44 |        0 |       0 |    3.84 | 15-178                                                                                                                                                   
  secure.util.ts                   |    5.76 |        0 |       0 |       6 | 16-149                                                                                                                                                   
  token.util.ts                    |    5.12 |        0 |       0 |    5.26 | 84-504                                                                                                                                                   
  type.util.ts                     |       0 |        0 |       0 |       0 | 7-319                                                                                                                                                    
  user.util.ts                     |    6.49 |        0 |       0 |    6.66 | 83-382                                                                                                                                                   
  validators.util.ts               |    1.96 |        0 |       0 |    2.73 | 21-353                                                                                                                                                   
 utils/string                      |    11.3 |        0 |       0 |   13.64 |                                                                                                                                                          
  crypto.util.ts                   |    4.54 |        0 |       0 |    4.61 | 15-382                                                                                                                                                   
  extract.util.ts                  |    1.51 |        0 |       0 |    1.98 | 14-354                                                                                                                                                   
  format.util.ts                   |    2.56 |        0 |       0 |    2.85 | 14-245                                                                                                                                                   
  index.ts                         |     100 |      100 |     100 |     100 |                                                                                                                                                          
  mask.util.ts                     |    0.95 |        0 |       0 |     1.2 | 13-275                                                                                                                                                   
  normalize.util.ts                |    0.82 |        0 |       0 |    1.09 | 23-398                                                                                                                                                   
 utils/tests                       |       0 |      100 |     100 |       0 |                                                                                                                                                          
  index.ts                         |       0 |      100 |     100 |       0 | 7-15                                                                                                                                                     
 validates                         |   17.94 |        0 |       0 |   19.09 |                                                                                                                                                          
  auth.validate.ts                 |   17.24 |        0 |       0 |   17.24 | 35-50,82-139                                                                                                                                             
  base.validate.ts                 |   21.42 |        0 |       0 |   21.42 | 16-81,181-256                                                                                                                                            
  course.validate.ts               |   41.66 |        0 |       0 |   41.66 | 98-121                                                                                                                                                   
  file.validate.ts                 |       0 |        0 |       0 |       0 | 1-88                                                                                                                                                     
  index.ts                         |       0 |      100 |       0 |       0 | 7-53                                                                                                                                                     
  user.validate.ts                 |   35.71 |        0 |       0 |   35.71 | 99-114,215-238                                                                                                                                           
-----------------------------------|---------|----------|---------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------
Jest: "global" coverage threshold for statements (25%) not met: 13.72%
Jest: "global" coverage threshold for branches (15%) not met: 2.71%
Jest: "global" coverage threshold for lines (25%) not met: 13.6%
Jest: "global" coverage threshold for functions (18%) not met: 4.65%
Test Suites: 4 failed, 4 total
Tests:       35 failed, 35 total
Snapshots:   0 total
Time:        25.619 s
Ran all test suites matching e2e.
Error: Process completed with exit code 1.