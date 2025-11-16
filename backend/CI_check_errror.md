Run npm run test:e2e

> backend@1.0.0 test:e2e
> cross-env TEST_CATEGORY=integration E2E_SUITE=true jest --config jest.config.js --testPathPatterns=e2e --detectOpenHandles --runInBand

PASS src/tests/e2e/course-enrollment.e2e.test.ts (17.051 s)
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

    console.log
      ✅ PostgreSQL enum types created successfully

      at Object.createEnumTypes [as up] (src/migrations/000-create-enum-types.ts:144:11)

    console.log
      [SQL_SHIM] replacements->bind INSERT INTO migrations (version, description, executed_at) VALUES ($1, $2, CURRENT_TIMESTAMP)

      at Sequelize.proto.query (src/tests/utils/test.utils.ts:97:21)

    console.log
      [SQL_SHIM] replacements->bind INSERT INTO migrations (version, description, executed_at) VALUES ($1, $2, CURRENT_TIMESTAMP)

      at Sequelize.proto.query (src/tests/utils/test.utils.ts:97:21)

    console.log
      [SQL_SHIM] replacements->bind INSERT INTO migrations (version, description, executed_at) VALUES ($1, $2, CURRENT_TIMESTAMP)

      at Sequelize.proto.query (src/tests/utils/test.utils.ts:97:21)

    console.log
      [SQL_SHIM] replacements->bind INSERT INTO migrations (version, description, executed_at) VALUES ($1, $2, CURRENT_TIMESTAMP)

      at Sequelize.proto.query (src/tests/utils/test.utils.ts:97:21)

    console.log
      [SQL_SHIM] replacements->bind INSERT INTO migrations (version, description, executed_at) VALUES ($1, $2, CURRENT_TIMESTAMP)

      at Sequelize.proto.query (src/tests/utils/test.utils.ts:97:21)

    console.log
      [SQL_SHIM] replacements->bind INSERT INTO migrations (version, description, executed_at) VALUES ($1, $2, CURRENT_TIMESTAMP)

      at Sequelize.proto.query (src/tests/utils/test.utils.ts:97:21)

    console.log
      [SQL_SHIM] replacements->bind INSERT INTO migrations (version, description, executed_at) VALUES ($1, $2, CURRENT_TIMESTAMP)

      at Sequelize.proto.query (src/tests/utils/test.utils.ts:97:21)

    console.log
      [SQL_SHIM] replacements->bind INSERT INTO migrations (version, description, executed_at) VALUES ($1, $2, CURRENT_TIMESTAMP)

      at Sequelize.proto.query (src/tests/utils/test.utils.ts:97:21)

    console.log
      [SQL_SHIM] replacements->bind INSERT INTO migrations (version, description, executed_at) VALUES ($1, $2, CURRENT_TIMESTAMP)

      at Sequelize.proto.query (src/tests/utils/test.utils.ts:97:21)

    console.log
      [SQL_SHIM] replacements->bind INSERT INTO migrations (version, description, executed_at) VALUES ($1, $2, CURRENT_TIMESTAMP)

      at Sequelize.proto.query (src/tests/utils/test.utils.ts:97:21)

    console.error
      [SQL_SHIM_ERROR] default column "email_verified_at" of relation "users" already exists ALTER TABLE "public"."users" ADD COLUMN "email_verified_at" TIMESTAMP WITH TIME ZONE; COMMENT ON COLUMN "users"."email_verified_at" IS 'Timestamp when email was verified';

      126 |         .catch((err: any) => {
      127 |         // eslint-disable-next-line no-console
    > 128 |         console.error('[SQL_SHIM_ERROR] default', err?.message, typeof sqlText === 'string' ? sqlText : '<<non-string-sql>>');
          |                 ^
      129 |         throw err;
      130 |       });
      131 |     };

      at src/tests/utils/test.utils.ts:128:17
      at PostgresQueryInterface.addColumn (node_modules/sequelize/src/dialects/abstract/query-interface.js:430:12)
      at Object.addEmailVerifiedAt [as up] (src/migrations/010-add-email-verified-at.ts:10:5)
      at MigrationManager.migrate (src/migrations/index.ts:241:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

    console.log
      [SQL_SHIM] replacements->bind INSERT INTO migrations (version, description, executed_at) VALUES ($1, $2, CURRENT_TIMESTAMP)

      at Sequelize.proto.query (src/tests/utils/test.utils.ts:97:21)

    console.error
      [SQL_SHIM_ERROR] default column "date_of_birth" of relation "users" already exists ALTER TABLE "public"."users" ADD COLUMN "date_of_birth" DATE; COMMENT ON COLUMN "users"."date_of_birth" IS 'Ngày sinh';

      126 |         .catch((err: any) => {
      127 |         // eslint-disable-next-line no-console
    > 128 |         console.error('[SQL_SHIM_ERROR] default', err?.message, typeof sqlText === 'string' ? sqlText : '<<non-string-sql>>');
          |                 ^
      129 |         throw err;
      130 |       });
      131 |     };

      at src/tests/utils/test.utils.ts:128:17
      at PostgresQueryInterface.addColumn (node_modules/sequelize/src/dialects/abstract/query-interface.js:430:12)
      at addColumnSafe (src/migrations/011-add-user-profile-columns.ts:11:7)
      at Object.addUserProfileColumns [as up] (src/migrations/011-add-user-profile-columns.ts:33:3)
      at MigrationManager.migrate (src/migrations/index.ts:241:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

    console.error
      [SQL_SHIM_ERROR] default column "gender" of relation "users" already exists DO 'BEGIN CREATE TYPE "public"."enum_users_gender" AS ENUM(''male'', ''female'', ''other''); EXCEPTION WHEN duplicate_object THEN null; END';ALTER TABLE "public"."users" ADD COLUMN "gender" "public"."enum_users_gender"; COMMENT ON COLUMN "users"."gender" IS 'Giới tính';

      126 |         .catch((err: any) => {
      127 |         // eslint-disable-next-line no-console
    > 128 |         console.error('[SQL_SHIM_ERROR] default', err?.message, typeof sqlText === 'string' ? sqlText : '<<non-string-sql>>');
          |                 ^
      129 |         throw err;
      130 |       });
      131 |     };

      at src/tests/utils/test.utils.ts:128:17
      at PostgresQueryInterface.addColumn (node_modules/sequelize/src/dialects/abstract/query-interface.js:430:12)
      at addColumnSafe (src/migrations/011-add-user-profile-columns.ts:11:7)
      at Object.addUserProfileColumns [as up] (src/migrations/011-add-user-profile-columns.ts:34:3)
      at MigrationManager.migrate (src/migrations/index.ts:241:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

    console.error
      [SQL_SHIM_ERROR] default column "address" of relation "users" already exists ALTER TABLE "public"."users" ADD COLUMN "address" TEXT; COMMENT ON COLUMN "users"."address" IS 'Địa chỉ';

      126 |         .catch((err: any) => {
      127 |         // eslint-disable-next-line no-console
    > 128 |         console.error('[SQL_SHIM_ERROR] default', err?.message, typeof sqlText === 'string' ? sqlText : '<<non-string-sql>>');
          |                 ^
      129 |         throw err;
      130 |       });
      131 |     };

      at src/tests/utils/test.utils.ts:128:17
      at PostgresQueryInterface.addColumn (node_modules/sequelize/src/dialects/abstract/query-interface.js:430:12)
      at addColumnSafe (src/migrations/011-add-user-profile-columns.ts:11:7)
      at Object.addUserProfileColumns [as up] (src/migrations/011-add-user-profile-columns.ts:35:3)
      at MigrationManager.migrate (src/migrations/index.ts:241:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

    console.error
      [SQL_SHIM_ERROR] default column "emergency_contact" of relation "users" already exists ALTER TABLE "public"."users" ADD COLUMN "emergency_contact" VARCHAR(100); COMMENT ON COLUMN "users"."emergency_contact" IS 'Liên hệ khẩn cấp';

      126 |         .catch((err: any) => {
      127 |         // eslint-disable-next-line no-console
    > 128 |         console.error('[SQL_SHIM_ERROR] default', err?.message, typeof sqlText === 'string' ? sqlText : '<<non-string-sql>>');
          |                 ^
      129 |         throw err;
      130 |       });
      131 |     };

      at src/tests/utils/test.utils.ts:128:17
      at PostgresQueryInterface.addColumn (node_modules/sequelize/src/dialects/abstract/query-interface.js:430:12)
      at addColumnSafe (src/migrations/011-add-user-profile-columns.ts:11:7)
      at Object.addUserProfileColumns [as up] (src/migrations/011-add-user-profile-columns.ts:36:3)
      at MigrationManager.migrate (src/migrations/index.ts:241:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

    console.error
      [SQL_SHIM_ERROR] default column "emergency_phone" of relation "users" already exists ALTER TABLE "public"."users" ADD COLUMN "emergency_phone" VARCHAR(20); COMMENT ON COLUMN "users"."emergency_phone" IS 'SĐT khẩn cấp';

      126 |         .catch((err: any) => {
      127 |         // eslint-disable-next-line no-console
    > 128 |         console.error('[SQL_SHIM_ERROR] default', err?.message, typeof sqlText === 'string' ? sqlText : '<<non-string-sql>>');
          |                 ^
      129 |         throw err;
      130 |       });
      131 |     };

      at src/tests/utils/test.utils.ts:128:17
      at PostgresQueryInterface.addColumn (node_modules/sequelize/src/dialects/abstract/query-interface.js:430:12)
      at addColumnSafe (src/migrations/011-add-user-profile-columns.ts:11:7)
      at Object.addUserProfileColumns [as up] (src/migrations/011-add-user-profile-columns.ts:37:3)
      at MigrationManager.migrate (src/migrations/index.ts:241:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

    console.log
      [SQL_SHIM] replacements->bind INSERT INTO migrations (version, description, executed_at) VALUES ($1, $2, CURRENT_TIMESTAMP)

      at Sequelize.proto.query (src/tests/utils/test.utils.ts:97:21)

    console.log
      ✅ Model associations setup completed

      at log (src/models/associations.ts:263:11)

    console.log
      ✅ Extended model associations setup completed

      at log (src/models/associations-extended.ts:340:11)

    console.log
      2025-11-16 17:08:29 [error]: Error creating enrollment: Course not found {
        "service": "lms-backend",
        "statusCode": 404,
        "stack": "Error: Course not found\n    at EnrollmentService.createEnrollment (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/enrollment/enrollment.service.ts:59:15)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at EnrollmentController.createEnrollment (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/enrollment/enrollment.controller.ts:22:26)"
      } traceId=00000000000000000000000000000000 spanId=0000000000000000

      at Console.log (node_modules/winston/lib/winston/transports/console.js:87:23)

    console.log
      2025-11-16 17:08:29 [error]: Error creating enrollment: Course not found {
        "service": "lms-backend",
        "statusCode": 404,
        "stack": "Error: Course not found\n    at EnrollmentService.createEnrollment (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/enrollment/enrollment.service.ts:59:15)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at EnrollmentController.createEnrollment (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/enrollment/enrollment.controller.ts:22:26)"
      } traceId=00000000000000000000000000000000 spanId=0000000000000000

      at Console.log (node_modules/winston/lib/winston/transports/console.js:87:23)

    console.log
      2025-11-16 17:08:29 [error]: HTTP error occurred {
        "service": "lms-backend",
        "error": "Course not found",
        "stack": "Error: Course not found\n    at EnrollmentService.createEnrollment (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/enrollment/enrollment.service.ts:59:15)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at EnrollmentController.createEnrollment (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/enrollment/enrollment.controller.ts:22:26)",
        "method": "POST",
        "url": "/api/v1/enrollments",
        "statusCode": 404,
        "ip": "::ffff:127.0.0.1"
      } traceId=00000000000000000000000000000000 spanId=0000000000000000

      at Console.log (node_modules/winston/lib/winston/transports/console.js:87:23)

    console.log
      2025-11-16 17:08:29 [error]: Error creating enrollment: User is already enrolled in this course {
        "service": "lms-backend",
        "statusCode": 409,
        "stack": "Error: User is already enrolled in this course\n    at EnrollmentService.createEnrollment (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/enrollment/enrollment.service.ts:81:15)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at EnrollmentController.createEnrollment (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/enrollment/enrollment.controller.ts:22:26)"
      } traceId=00000000000000000000000000000000 spanId=0000000000000000

      at Console.log (node_modules/winston/lib/winston/transports/console.js:87:23)

    console.log
      2025-11-16 17:08:29 [error]: Error creating enrollment: User is already enrolled in this course {
        "service": "lms-backend",
        "statusCode": 409,
        "stack": "Error: User is already enrolled in this course\n    at EnrollmentService.createEnrollment (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/enrollment/enrollment.service.ts:81:15)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at EnrollmentController.createEnrollment (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/enrollment/enrollment.controller.ts:22:26)"
      } traceId=00000000000000000000000000000000 spanId=0000000000000000

      at Console.log (node_modules/winston/lib/winston/transports/console.js:87:23)

    console.log
      2025-11-16 17:08:29 [error]: HTTP error occurred {
        "service": "lms-backend",
        "error": "User is already enrolled in this course",
        "stack": "Error: User is already enrolled in this course\n    at EnrollmentService.createEnrollment (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/enrollment/enrollment.service.ts:81:15)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at EnrollmentController.createEnrollment (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/enrollment/enrollment.controller.ts:22:26)",
        "method": "POST",
        "url": "/api/v1/enrollments",
        "statusCode": 409,
        "ip": "::ffff:127.0.0.1"
      } traceId=00000000000000000000000000000000 spanId=0000000000000000

      at Console.log (node_modules/winston/lib/winston/transports/console.js:87:23)

PASS src/tests/e2e/course-registration.e2e.test.ts
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
      [dotenv@17.2.3] injecting env (25) from src/tests/integration/test.env -- tip: 👥 sync secrets across teammates & machines: https://dotenvx.com/ops

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

    console.log
      ✅ Model associations setup completed

      at log (src/models/associations.ts:263:11)

    console.log
      ✅ Extended model associations setup completed

      at log (src/models/associations-extended.ts:340:11)

    console.log
      2025-11-16 17:08:32 [error]: Zod validation error {
        "service": "lms-backend",
        "method": "POST",
        "path": "/",
        "issues": [
          {
            "path": [
              "title"
            ],
            "message": "Course title must be at least 3 characters",
            "code": "too_small"
          }
        ]
      } traceId=00000000000000000000000000000000 spanId=0000000000000000

      at Console.log (node_modules/winston/lib/winston/transports/console.js:87:23)

    console.log
      2025-11-16 17:08:32 [error]: HTTP error occurred {
        "service": "lms-backend",
        "error": "Course not found",
        "stack": "Error: Course not found\n    at CourseController.getCourseById (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/course/course.controller.ts:73:15)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)",
        "method": "GET",
        "url": "/api/v1/courses/00000000-0000-0000-0000-000000000000",
        "statusCode": 404,
        "ip": "::ffff:127.0.0.1"
      } traceId=00000000000000000000000000000000 spanId=0000000000000000

      at Console.log (node_modules/winston/lib/winston/transports/console.js:87:23)

    console.log
      2025-11-16 17:08:32 [error]: Error deleting course: Course not found {
        "service": "lms-backend",
        "statusCode": 404,
        "isOperational": true,
        "stack": "Error: Course not found\n    at CourseService.deleteCourse (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/course/course.service.ts:123:15)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at CourseController.deleteCourse (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/course/course.controller.ts:112:7)"
      } traceId=00000000000000000000000000000000 spanId=0000000000000000

      at Console.log (node_modules/winston/lib/winston/transports/console.js:87:23)

    console.log
      2025-11-16 17:08:32 [error]: HTTP error occurred {
        "service": "lms-backend",
        "error": "Course not found",
        "stack": "Error: Course not found\n    at CourseService.deleteCourse (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/course/course.service.ts:123:15)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at CourseController.deleteCourse (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/modules/course/course.controller.ts:112:7)",
        "method": "DELETE",
        "url": "/api/v1/courses/00000000-0000-0000-0000-000000000000",
        "statusCode": 404,
        "ip": "::ffff:127.0.0.1"
      } traceId=00000000000000000000000000000000 spanId=0000000000000000

      at Console.log (node_modules/winston/lib/winston/transports/console.js:87:23)

PASS src/tests/e2e/health.e2e.test.ts
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
      [dotenv@17.2.3] injecting env (25) from src/tests/integration/test.env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }

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

    console.log
      ✅ Model associations setup completed

      at log (src/models/associations.ts:263:11)

    console.log
      ✅ Extended model associations setup completed

      at log (src/models/associations-extended.ts:340:11)

PASS src/tests/e2e/metrics.e2e.test.ts
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
      [dotenv@17.2.3] injecting env (25) from src/tests/integration/test.env -- tip: 🔑 add access controls to secrets: https://dotenvx.com/ops

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

    console.log
      ✅ Model associations setup completed

      at log (src/models/associations.ts:263:11)

    console.log
      ✅ Extended model associations setup completed

      at log (src/models/associations-extended.ts:340:11)

-----------------------------------|---------|----------|---------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------
File                               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                                                                                                                                        
-----------------------------------|---------|----------|---------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------
All files                          |   20.82 |    10.06 |    11.4 |   21.02 |                                                                                                                                                          
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
 config                            |    37.5 |    51.53 |   33.33 |   35.76 |                                                                                                                                                          
  cors.config.ts                   |      80 |       50 |      50 |    87.5 | 10                                                                                                                                                       
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
 errors                            |   17.78 |    10.82 |    6.81 |   20.24 |                                                                                                                                                          
  api.error.ts                     |    6.89 |        0 |       0 |       8 | 27-198                                                                                                                                                   
  authentication.error.ts          |    5.71 |        0 |       0 |    7.14 | 42-203                                                                                                                                                   
  authorization.error.ts           |    5.55 |        0 |       0 |    7.14 | 32-188                                                                                                                                                   
  base.error.ts                    |      60 |    46.66 |   27.27 |      60 | 75-94,108,122-162                                                                                                                                        
  database.error.ts                |    3.27 |        0 |       0 |    4.08 | 45-289                                                                                                                                                   
  error.constants.ts               |       0 |      100 |     100 |       0 | 7-151                                                                                                                                                    
  error.factory.ts                 |      30 |       24 |    8.33 |      30 | 26-134,149-152,162-171,191-199,213-306                                                                                                                   
  error.handler.ts                 |      50 |    32.43 |      20 |      50 | 36,51,65-137,152,154,156,158-159,161,163-164,175-221                                                                                                     
  error.utils.ts                   |   14.47 |    12.72 |   16.66 |   14.66 | 14-78,104,110-131,150-160,175-275                                                                                                                        
  external-service.error.ts        |       4 |        0 |       0 |    4.87 | 47-238                                                                                                                                                   
  file.error.ts                    |    5.55 |        0 |       0 |    7.14 | 45-211                                                                                                                                                   
  index.ts                         |       0 |      100 |       0 |       0 | 7-29                                                                                                                                                     
  validation.error.ts              |    5.71 |        0 |       0 |    6.89 | 46-185                                                                                                                                                   
 middlewares                       |   55.64 |    40.17 |   52.27 |   54.75 |                                                                                                                                                          
  auth-rate-limit.middleware.ts    |   66.66 |    30.76 |   33.33 |   63.63 | 7,26-28                                                                                                                                                  
  auth.middleware.ts               |   51.02 |    38.88 |      75 |   47.82 | 40-51,70-91,97-115                                                                                                                                       
  error.middleware.ts              |     100 |      100 |     100 |     100 |                                                                                                                                                          
  logger.middleware.ts             |     100 |    71.42 |     100 |     100 | 11-24                                                                                                                                                    
  tracing.middleware.ts            |   71.05 |       50 |   42.85 |   71.05 | 50-53,61-67,71-72,77-78                                                                                                                                  
  uuid-validation.middleware.ts    |       0 |        0 |       0 |       0 | 3-66                                                                                                                                                     
  validate-dto.middleware.ts       |       0 |        0 |       0 |       0 | 2-118                                                                                                                                                    
  validate.middleware.ts           |   83.63 |    60.86 |   84.61 |   83.33 | 69,103,117-126                                                                                                                                           
 models                            |   69.77 |    12.85 |   11.39 |   69.32 |                                                                                                                                                          
  assignment-submission.model.ts   |     100 |      100 |     100 |     100 |                                                                                                                                                          
  assignment.model.ts              |     100 |      100 |     100 |     100 |                                                                                                                                                          
  associations-extended.ts         |     100 |      100 |     100 |     100 |                                                                                                                                                          
  associations.ts                  |     100 |      100 |     100 |     100 |                                                                                                                                                          
  category.model.ts                |   47.05 |        0 |       0 |   47.05 | 108,115-163                                                                                                                                              
  chat-message.model.ts            |    87.5 |      100 |       0 |    87.5 | 85                                                                                                                                                       
  course-statistics.model.ts       |     100 |      100 |     100 |     100 |                                                                                                                                                          
  course.model.ts                  |     100 |      100 |     100 |     100 |                                                                                                                                                          
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
  password-reset-token.model.ts    |   61.53 |        0 |       0 |   61.53 | 86-90,97-109                                                                                                                                             
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
  assignment.repository.ts         |    12.5 |        0 |    6.66 |    12.9 | 21-216                                                                                                                                                   
  assignment.routes.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                          
  assignment.service.ts            |    3.92 |        0 |    5.26 |       4 | 21-319                                                                                                                                                   
  assignment.validate.ts           |      50 |        0 |       0 |      50 | 6-7                                                                                                                                                      
  index.ts                         |       0 |      100 |       0 |       0 | 2-7                                                                                                                                                      
 modules/auth                      |    15.7 |     4.22 |   11.49 |   15.22 |                                                                                                                                                          
  auth.controller.ts               |   10.41 |        0 |   16.66 |   10.41 | 22-187                                                                                                                                                   
  auth.repository.ts               |   11.53 |     4.76 |   18.18 |   11.53 | 22-23,37,44-45,72-469                                                                                                                                    
  auth.routes.ts                   |   67.64 |      100 |    8.33 |   67.64 | 27,35,42,49,55,66,72,79,87,94,101                                                                                                                        
  auth.service.ts                  |   13.06 |     6.25 |   18.18 |   13.06 | 32,39,45,51,68-445                                                                                                                                       
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
 modules/course                    |   34.61 |    16.52 |   25.75 |   35.52 |                                                                                                                                                          
  course.controller.ts             |   47.52 |    30.76 |   54.54 |   47.52 | 30,62,88-89,99,109-110,126-146,152-175,181-197,203-218,224-240                                                                                           
  course.repository.ts             |   19.64 |       10 |   20.83 |   20.18 | 32-46,64,68,73,104-353                                                                                                                                   
  course.routes.ts                 |     100 |      100 |     100 |     100 |                                                                                                                                                          
  course.service.ts                |   38.73 |    21.62 |   54.54 |   38.73 | 28,37-38,54-55,76-77,91,96-98,108-109,128-130,148-259                                                                                                    
  course.validate.ts               |       0 |        0 |       0 |       0 | 1-231                                                                                                                                                    
  index.ts                         |       0 |      100 |       0 |       0 | 7-53                                                                                                                                                     
 modules/course-content            |   13.69 |        0 |    3.44 |    14.1 |                                                                                                                                                          
  course-content.controller.ts     |   15.78 |        0 |    4.76 |   15.78 | 26-40,49-66,75-86,95-108,117-129,138-151,164-178,187-199,208-221,230-242,251-264,277-291,300-312,321-332,345-358,367-379,388-400,409-421,430-442,455-472 
  course-content.repository.ts     |     3.3 |        0 |    3.03 |    3.57 | 51-432                                                                                                                                                   
  course-content.routes.ts         |     100 |      100 |     100 |     100 |                                                                                                                                                          
  course-content.service.ts        |    3.61 |        0 |    3.57 |    3.61 | 32-476                                                                                                                                                   
  course-content.validate.ts       |     100 |      100 |     100 |     100 |                                                                                                                                                          
  index.ts                         |       0 |      100 |       0 |       0 | 2-7                                                                                                                                                      
 modules/enrollment                |   48.42 |    53.67 |   46.91 |      50 |                                                                                                                                                          
  enrollment.controller.ts         |   42.37 |    73.33 |   52.94 |   42.37 | 60-61,74-90,105-106,119-120,134-253,276-277,298-299                                                                                                      
  enrollment.repository.ts         |    38.8 |     22.5 |      32 |   42.14 | 82-83,115-121,144-145,177-178,210-367                                                                                                                    
  enrollment.routes.ts             |    77.5 |      100 |      40 |    77.5 | 44,69,87,94,102,110,119,127,134                                                                                                                          
  enrollment.service.ts            |   53.52 |    64.28 |   63.15 |   54.67 | 68,91,121-122,134,139-140,153,158,163,170,179-180,192,197-198,211,223-224,240-241,255-341                                                                
  enrollment.validate.ts           |      60 |       60 |      60 |      60 | 91-130                                                                                                                                                   
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
 modules/user                      |   14.24 |        0 |    7.33 |   13.57 |                                                                                                                                                          
  index.ts                         |     100 |      100 |      60 |     100 |                                                                                                                                                          
  user.admin.controller.ts         |    8.41 |        0 |      10 |    8.41 | 32-274                                                                                                                                                   
  user.admin.routes.ts             |   65.62 |      100 |       0 |   65.62 | 29,41,53,65,77,93,106,118,131,140,149                                                                                                                    
  user.controller.ts               |     5.2 |        0 |    7.14 |     5.2 | 21-207                                                                                                                                                   
  user.repository.ts               |    2.68 |        0 |    5.26 |    2.68 | 57-485                                                                                                                                                   
  user.routes.ts                   |   59.25 |        0 |    5.88 |   59.25 | 24-27,43-47,57-61,68,75,81,87,95,101,106,113,119,126,133                                                                                                 
  user.service.ts                  |    4.93 |        0 |    5.26 |    4.96 | 26-428                                                                                                                                                   
  user.validate.ts                 |       0 |        0 |       0 |       0 | 1-369                                                                                                                                                    
 modules/webrtc                    |       0 |        0 |       0 |       0 |                                                                                                                                                          
  index.ts                         |       0 |      100 |     100 |       0 | 6-8                                                                                                                                                      
  webrtc.gateway.ts                |       0 |        0 |       0 |       0 | 7-574                                                                                                                                                    
  webrtc.service.ts                |       0 |        0 |       0 |       0 | 6-152                                                                                                                                                    
  webrtc.types.ts                  |       0 |        0 |       0 |       0 | 27-166                                                                                                                                                   
 monitoring                        |     100 |      100 |      50 |     100 |                                                                                                                                                          
  index.ts                         |     100 |      100 |   44.44 |     100 |                                                                                                                                                          
  ping.routes.ts                   |     100 |      100 |     100 |     100 |                                                                                                                                                          
 monitoring/health                 |   48.23 |    21.66 |   51.85 |    47.3 |                                                                                                                                                          
  health.controller.ts             |   44.23 |       25 |   44.44 |   44.23 | 28,37-42,55,60,69-78,93-96,105-114,123-128,137-142                                                                                                       
  health.routes.ts                 |     100 |      100 |     100 |     100 |                                                                                                                                                          
  health.service.ts                |    40.4 |    21.15 |      60 |    40.4 | 146-174,214,255-294,314,316,333-336,363-365,380-385,401-432                                                                                              
  index.ts                         |     100 |      100 |   33.33 |     100 |                                                                                                                                                          
 monitoring/metrics                |   31.04 |    29.27 |   21.42 |   31.71 |                                                                                                                                                          
  background-tasks.metrics.ts      |       0 |        0 |       0 |       0 | 7-318                                                                                                                                                    
  database.metrics.ts              |       0 |        0 |       0 |       0 | 8-235                                                                                                                                                    
  index.ts                         |     100 |      100 |      40 |     100 |                                                                                                                                                          
  metrics.controller.ts            |   23.11 |      2.5 |   11.11 |   23.49 | 40,49-53,62-78,87-103,112-131,140-159,168-178,187-191,200-209,218-227,236-245,254-265,281-284,289-356,382                                                
  metrics.middleware.ts            |   69.47 |    68.85 |   43.47 |   77.64 | 88,96,176,183,190,205,212,226,233,246-255                                                                                                                
  metrics.routes.ts                |     100 |       50 |     100 |     100 | 14-324                                                                                                                                                   
  metrics.service.ts               |   51.35 |    45.56 |   42.85 |   52.81 | 103,161,185,217,238-317,327,337-397,411,438-441,459-470,478,488-515                                                                                      
  redis.metrics.ts                 |       0 |        0 |       0 |       0 | 8-292                                                                                                                                                    
 repositories                      |   22.55 |    29.41 |   19.67 |   21.75 |                                                                                                                                                          
  base.repository.ts               |   40.54 |    56.25 |      50 |   40.54 | 53-54,76-77,99-100,117-136,156,161,167-168,185,190-191,208-393                                                                                           
  enrollment.repository.ts         |       0 |        0 |       0 |       0 | 2-245                                                                                                                                                    
  index.ts                         |       0 |      100 |       0 |       0 | 7-40                                                                                                                                                     
  user.repository.ts               |   19.48 |     7.14 |   11.53 |   15.94 | 32,39-416                                                                                                                                                
 routes                            |       0 |      100 |     100 |       0 |                                                                                                                                                          
  user.routes.ts                   |       0 |      100 |     100 |       0 | 9-12                                                                                                                                                     
 services/global                   |   12.74 |     2.32 |    11.2 |   11.87 |                                                                                                                                                          
  account-lockout.service.ts       |   13.95 |        0 |      20 |   14.28 | 15-94                                                                                                                                                    
  auth.service.ts                  |   18.75 |      100 |   14.28 |   18.75 | 13-78                                                                                                                                                    
  cache.service.ts                 |   12.64 |    11.76 |   18.75 |   12.19 | 24-97,107-184                                                                                                                                            
  email.service.ts                 |    6.06 |        0 |   16.66 |    6.06 | 23-140                                                                                                                                                   
  file.service.ts                  |    5.71 |        0 |      20 |    5.71 | 42-136                                                                                                                                                   
  index.ts                         |   96.87 |      100 |       0 |     100 |                                                                                                                                                          
  password-security.service.ts     |   35.55 |    33.33 |   42.85 |   36.36 | 16,20,53-54,67-95,113-130                                                                                                                                
  session-management.service.ts    |    7.21 |        0 |    6.66 |    7.52 | 28-231                                                                                                                                                   
  two-factor.service.ts            |    6.77 |        0 |    9.09 |     7.2 | 17-225                                                                                                                                                   
  user-refactored.service.ts       |       0 |        0 |       0 |       0 | 1-369                                                                                                                                                    
  user.service.ts                  |    7.69 |        0 |   11.11 |    7.87 | 80-159,176-372                                                                                                                                           
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
 utils                             |   17.48 |     7.94 |    9.14 |   18.07 |                                                                                                                                                          
  bcrypt.util.ts                   |   14.28 |       10 |   14.28 |   14.28 | 20-130                                                                                                                                                   
  constants.util.ts                |     100 |      100 |     100 |     100 |                                                                                                                                                          
  date.util.ts                     |    6.61 |     1.92 |    2.85 |    6.61 | 20-34,57-311                                                                                                                                             
  file.util.ts                     |    6.12 |        0 |       0 |    6.25 | 29-286                                                                                                                                                   
  hash.util.ts                     |   29.23 |        0 |    3.44 |   29.23 | 26-325                                                                                                                                                   
  index.ts                         |     100 |      100 |    12.5 |     100 |                                                                                                                                                          
  jwt.util.ts                      |   28.57 |        0 |      15 |   28.57 | 72-73,89-223,243-270                                                                                                                                     
  logger.util.ts                   |   33.33 |    13.95 |      20 |   35.13 | 126-137,142-145,150,154,158,181-265                                                                                                                      
  model-extension.util.ts          |   45.16 |    10.71 |   23.52 |   45.16 | 17-20,41,56,125-128,139-146,161,171,185-186,196-197,208,218-219,233-240,255,264-267                                                                      
  object.util.ts                   |    5.58 |     8.47 |    5.55 |    6.38 | 11-63,73-121,130,133,146-375                                                                                                                             
  pagination.util.ts               |   11.11 |    22.72 |    9.09 |   11.32 | 73-235                                                                                                                                                   
  response.util.ts                 |   67.34 |    38.46 |   42.85 |   66.66 | 79-103,145-165,175,179,191,207-249                                                                                                                       
  role.util.ts                     |    3.44 |        0 |       0 |    3.84 | 15-178                                                                                                                                                   
  secure.util.ts                   |    5.76 |        0 |       0 |       6 | 16-149                                                                                                                                                   
  token.util.ts                    |   17.09 |     3.03 |   18.18 |   17.54 | 100-101,118,127-128,154-365,381-504                                                                                                                      
  type.util.ts                     |       0 |        0 |       0 |       0 | 7-319                                                                                                                                                    
  user.util.ts                     |    9.09 |        0 |    5.26 |    9.33 | 123-382                                                                                                                                                  
  validators.util.ts               |    3.92 |     2.56 |    3.33 |    5.47 | 21-109,130-353                                                                                                                                           
 utils/string                      |    11.3 |        0 |       0 |   13.64 |                                                                                                                                                          
  crypto.util.ts                   |    4.54 |        0 |       0 |    4.61 | 15-382                                                                                                                                                   
  extract.util.ts                  |    1.51 |        0 |       0 |    1.98 | 14-354                                                                                                                                                   
  format.util.ts                   |    2.56 |        0 |       0 |    2.85 | 14-245                                                                                                                                                   
  index.ts                         |     100 |      100 |     100 |     100 |                                                                                                                                                          
  mask.util.ts                     |    0.95 |        0 |       0 |     1.2 | 13-275                                                                                                                                                   
  normalize.util.ts                |    0.82 |        0 |       0 |    1.09 | 23-398                                                                                                                                                   
 utils/tests                       |       0 |      100 |     100 |       0 |                                                                                                                                                          
  index.ts                         |       0 |      100 |     100 |       0 | 7-15                                                                                                                                                     
 validates                         |   20.51 |        0 |    6.12 |   21.81 |                                                                                                                                                          
  auth.validate.ts                 |   17.24 |        0 |       0 |   17.24 | 35-50,82-139                                                                                                                                             
  base.validate.ts                 |   32.14 |        0 |   17.64 |   32.14 | 60-81,181-256                                                                                                                                            
  course.validate.ts               |   41.66 |        0 |       0 |   41.66 | 98-121                                                                                                                                                   
  file.validate.ts                 |       0 |        0 |       0 |       0 | 1-88                                                                                                                                                     
  index.ts                         |       0 |      100 |       0 |       0 | 7-53                                                                                                                                                     
  user.validate.ts                 |   35.71 |        0 |       0 |   35.71 | 99-114,215-238                                                                                                                                           
-----------------------------------|---------|----------|---------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------
Jest: "global" coverage threshold for statements (25%) not met: 20.82%
Jest: "global" coverage threshold for branches (15%) not met: 10.06%
Jest: "global" coverage threshold for lines (25%) not met: 21.02%
Jest: "global" coverage threshold for functions (18%) not met: 11.4%

Test Suites: 4 passed, 4 total
Tests:       35 passed, 35 total
Snapshots:   0 total
Time:        28.462 s
Ran all test suites matching e2e.
Error: Process completed with exit code 1.