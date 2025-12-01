Run e2e tests with PostgreSQL (hard-fail) : 
Run npm run test:e2e

> backend@1.0.0 test:e2e
> cross-env TEST_CATEGORY=integration E2E_SUITE=true jest --config jest.config.js --testPathPatterns=e2e --detectOpenHandles --runInBand

FAIL src/tests/e2e/course-enrollment.e2e.test.ts (19.759 s)
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
      [dotenv@17.2.3] injecting env (25) from src/tests/integration/test.env -- tip: 📡 add observability to secrets: https://dotenvx.com/ops

      at _log (node_modules/dotenv/lib/main.js:142:11)

    console.log
      [API_ROUTE_DEBUG_COUNT] 4

      at Object.<anonymous> (src/app.ts:161:11)

    console.log
      [API_ROUTE_DEBUG_LIST] [
        'GET /users/profile',
        'PUT /users/profile',
        'PUT /users/change-password',
        'GET /__routes_debug'
      ]

      at Object.<anonymous> (src/app.ts:163:11)

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
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
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
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
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
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
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
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
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
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
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
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

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
      2025-12-01 16:59:11 [error]: Migration 020 failed: No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive. {
        "service": "lms-backend",
        "stack": "Error: No description found for \"comment_moderations\" table. Check the table name and schema; remember, they _are_ case sensitive.\n    at PostgresQueryInterface.describeTable (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at Object.up (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)\n    at MigrationManager.migrate (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/migrations/index.ts:284:9)\n    at Object.<anonymous> (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/tests/setup.ts:147:7)"
      }

      at Console.log (node_modules/winston/lib/winston/transports/console.js:87:23)

  ● Course Enrollment E2E › POST /api/v1/enrollments › should enroll in course successfully

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Enrollment E2E › POST /api/v1/enrollments › should fail to enroll without authentication

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Enrollment E2E › POST /api/v1/enrollments › should fail to enroll in non-existent course

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Enrollment E2E › POST /api/v1/enrollments › should fail to enroll twice in same course

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Enrollment E2E › GET /api/v1/enrollments › should get user enrollments

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Enrollment E2E › GET /api/v1/enrollments › should get enrollments with pagination

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Enrollment E2E › GET /api/v1/enrollments › should filter enrollments by status

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Enrollment E2E › GET /api/v1/enrollments/:id › should get enrollment by ID

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Enrollment E2E › GET /api/v1/enrollments/:id › should return 404 for non-existent enrollment

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Enrollment E2E › PUT /api/v1/enrollments/:id/progress › should update enrollment progress

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Enrollment E2E › PUT /api/v1/enrollments/:id/progress › should fail to update progress without authentication

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Enrollment E2E › PUT /api/v1/enrollments/:id/complete › should complete enrollment successfully

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Enrollment E2E › PUT /api/v1/enrollments/:id/complete › should fail to complete enrollment without authentication

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Enrollment E2E › DELETE /api/v1/enrollments/:id › should drop enrollment successfully

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Enrollment E2E › DELETE /api/v1/enrollments/:id › should return 404 when dropping non-existent enrollment

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Enrollment E2E › GET /api/v1/courses/:id/enrollments › should get course enrollments (instructor only)

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Enrollment E2E › GET /api/v1/users/:id/enrollments › should get user enrollment history

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

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

      at Object.<anonymous> (src/app.ts:161:11)

    console.log
      [API_ROUTE_DEBUG_LIST] [
        'GET /users/profile',
        'PUT /users/profile',
        'PUT /users/change-password',
        'GET /__routes_debug'
      ]

      at Object.<anonymous> (src/app.ts:163:11)

    console.log
      OpenTelemetry tracing started (local only, no OTLP export)

      at log (src/tracing/tracing.ts:45:15)

    console.log
      2025-12-01 16:59:14 [error]: Migration 020 failed: No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive. {
        "service": "lms-backend",
        "stack": "Error: No description found for \"comment_moderations\" table. Check the table name and schema; remember, they _are_ case sensitive.\n    at PostgresQueryInterface.describeTable (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at Object.up (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)\n    at MigrationManager.migrate (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/migrations/index.ts:284:9)\n    at Object.<anonymous> (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/tests/setup.ts:147:7)"
      }

      at Console.log (node_modules/winston/lib/winston/transports/console.js:87:23)

  ● Course Registration E2E › POST /api/v1/courses › should create a new course successfully

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Registration E2E › POST /api/v1/courses › should fail to create course without authentication

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Registration E2E › POST /api/v1/courses › should fail to create course with invalid data

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Registration E2E �� GET /api/v1/courses › should get all courses

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Registration E2E › GET /api/v1/courses › should get courses with pagination

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Registration E2E › GET /api/v1/courses › should filter courses by category

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Registration E2E › GET /api/v1/courses/:id › should get course by ID

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Registration E2E › GET /api/v1/courses/:id › should return 404 for non-existent course

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Registration E2E › PUT /api/v1/courses/:id › should update course successfully

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Registration E2E › PUT /api/v1/courses/:id › should fail to update course without authentication

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Registration E2E › DELETE /api/v1/courses/:id › should delete course successfully

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● Course Registration E2E › DELETE /api/v1/courses/:id › should return 404 when deleting non-existent course

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

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
      [dotenv@17.2.3] injecting env (25) from src/tests/integration/test.env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild

      at _log (node_modules/dotenv/lib/main.js:142:11)

    console.log
      [API_ROUTE_DEBUG_COUNT] 4

      at Object.<anonymous> (src/app.ts:161:11)

    console.log
      [API_ROUTE_DEBUG_LIST] [
        'GET /users/profile',
        'PUT /users/profile',
        'PUT /users/change-password',
        'GET /__routes_debug'
      ]

      at Object.<anonymous> (src/app.ts:163:11)

    console.log
      OpenTelemetry tracing started (local only, no OTLP export)

      at log (src/tracing/tracing.ts:45:15)

    console.log
      2025-12-01 16:59:18 [error]: Migration 020 failed: No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive. {
        "service": "lms-backend",
        "stack": "Error: No description found for \"comment_moderations\" table. Check the table name and schema; remember, they _are_ case sensitive.\n    at PostgresQueryInterface.describeTable (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at Object.up (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)\n    at MigrationManager.migrate (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/migrations/index.ts:284:9)\n    at Object.<anonymous> (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/tests/setup.ts:147:7)"
      }

      at Console.log (node_modules/winston/lib/winston/transports/console.js:87:23)

  ● E2E: Health endpoints › GET /ping should return 200 and plain text pong

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● E2E: Health endpoints › GET /health should return overall health

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● E2E: Health endpoints › GET /health/ready should return readiness

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● E2E: Health endpoints › GET /health/database should return db health payload

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

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
      [dotenv@17.2.3] injecting env (25) from src/tests/integration/test.env -- tip: ⚙️  override existing env vars with { override: true }

      at _log (node_modules/dotenv/lib/main.js:142:11)

    console.log
      [API_ROUTE_DEBUG_COUNT] 4

      at Object.<anonymous> (src/app.ts:161:11)

    console.log
      [API_ROUTE_DEBUG_LIST] [
        'GET /users/profile',
        'PUT /users/profile',
        'PUT /users/change-password',
        'GET /__routes_debug'
      ]

      at Object.<anonymous> (src/app.ts:163:11)

    console.log
      OpenTelemetry tracing started (local only, no OTLP export)

      at log (src/tracing/tracing.ts:45:15)

    console.log
      2025-12-01 16:59:20 [error]: Migration 020 failed: No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive. {
        "service": "lms-backend",
        "stack": "Error: No description found for \"comment_moderations\" table. Check the table name and schema; remember, they _are_ case sensitive.\n    at PostgresQueryInterface.describeTable (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at Object.up (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)\n    at MigrationManager.migrate (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/migrations/index.ts:284:9)\n    at Object.<anonymous> (/home/runner/work/DoAnChuyenNganh/DoAnChuyenNganh/backend/src/tests/setup.ts:147:7)"
      }

      at Console.log (node_modules/winston/lib/winston/transports/console.js:87:23)

  ● E2E: Metrics endpoints › GET /metrics/prometheus should return text/plain and include baseline metrics

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

  ● E2E: Metrics endpoints › GET /metrics should return json with success

    No description found for "comment_moderations" table. Check the table name and schema; remember, they _are_ case sensitive.

      12 | export async function up(queryInterface: QueryInterface): Promise<void> {
      13 |   // Check if column already exists
    > 14 |   const tableDescription = await queryInterface.describeTable('comment_moderations');
         |                            ^
      15 |   
      16 |   if (!tableDescription.message_content) {
      17 |     await queryInterface.addColumn('comment_moderations', 'message_content', {

      at PostgresQueryInterface.describeTable (node_modules/sequelize/src/dialects/abstract/query-interface.js:394:15)
      at Object.up (src/migrations/020-add-message-content-to-comment-moderations.ts:14:28)
      at MigrationManager.migrate (src/migrations/index.ts:284:9)
      at Object.<anonymous> (src/tests/setup.ts:147:7)

-----------------------------------|---------|----------|---------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------
File                               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                                                                                                                                                
-----------------------------------|---------|----------|---------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------
All files                          |    17.1 |     6.07 |    7.79 |      17 |                                                                                                                                                                  
 api                               |   59.64 |        0 |   14.28 |   62.26 |                                                                                                                                                                  
  index.ts                         |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  routes.ts                        |   55.76 |        0 |       0 |   59.18 | 34-52,73-87                                                                                                                                                      
 api/v1                            |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  index.ts                         |     100 |      100 |     100 |     100 |                                                                                                                                                                  
 api/v1/routes                     |   91.34 |      100 |       0 |     100 |                                                                                                                                                                  
  assignment.routes.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  auth.routes.ts                   |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  course.routes.ts                 |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  enrollment.routes.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  index.ts                         |   89.74 |      100 |       0 |     100 |                                                                                                                                                                  
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
 config                            |   41.25 |    63.12 |   33.33 |   39.47 |                                                                                                                                                                  
  cors.config.ts                   |   52.38 |     12.5 |      50 |   52.63 | 17-31                                                                                                                                                            
  db.ts                            |   36.58 |    26.53 |      25 |   35.89 | 20-25,52-73,80-103                                                                                                                                               
  env.config.ts                    |   83.33 |    83.11 |   77.77 |   81.25 | 18-21                                                                                                                                                            
  index.ts                         |       0 |      100 |     100 |       0 | 2-5                                                                                                                                                              
  jwt.config.ts                    |     100 |       90 |       0 |     100 | 3                                                                                                                                                                
  mail.config.ts                   |   22.58 |      100 |       0 |   22.58 | 21-26,34-101                                                                                                                                                     
  redis.config.ts                  |    28.2 |    66.66 |       0 |    28.2 | 13,20,24,28,33-38,45-81                                                                                                                                          
  swagger.config.ts                |     100 |      100 |     100 |     100 |                                                                                                                                                                  
 constants                         |   95.16 |    89.28 |     100 |   95.16 |                                                                                                                                                                  
  app.constants.ts                 |     100 |       50 |     100 |     100 | 66-73                                                                                                                                                            
  response.constants.ts            |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  roles.enum.ts                    |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  user.constants.ts                |       0 |      100 |     100 |       0 | 2-65                                                                                                                                                             
 errors                            |   13.38 |        0 |       0 |   12.42 |                                                                                                                                                                  
  api.error.ts                     |    6.89 |        0 |       0 |       8 | 27-198                                                                                                                                                           
  authentication.error.ts          |    5.71 |        0 |       0 |    7.14 | 42-203                                                                                                                                                           
  authorization.error.ts           |    5.55 |        0 |       0 |    7.14 | 32-188                                                                                                                                                           
  base.error.ts                    |    3.33 |        0 |       0 |    3.33 | 44-162                                                                                                                                                           
  database.error.ts                |    3.27 |        0 |       0 |    4.08 | 45-289                                                                                                                                                           
  error.constants.ts               |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  error.factory.ts                 |   11.25 |        0 |       0 |   11.25 | 26-306                                                                                                                                                           
  error.handler.ts                 |   26.47 |        0 |       0 |   26.47 | 32-221                                                                                                                                                           
  error.utils.ts                   |    2.63 |        0 |       0 |    2.66 | 14-275                                                                                                                                                           
  external-service.error.ts        |       4 |        0 |       0 |    4.87 | 47-238                                                                                                                                                           
  file.error.ts                    |    5.55 |        0 |       0 |    7.14 | 45-211                                                                                                                                                           
  index.ts                         |     100 |      100 |       0 |     100 |                                                                                                                                                                  
  validation.error.ts              |    5.71 |        0 |       0 |    6.89 | 46-185                                                                                                                                                           
 middlewares                       |   33.88 |    22.05 |   32.69 |   32.15 |                                                                                                                                                                  
  auth-rate-limit.middleware.ts    |   66.66 |    30.76 |   33.33 |   63.63 | 7,26-28                                                                                                                                                          
  auth.middleware.ts               |   46.93 |    33.33 |      75 |   43.47 | 22-28,40-51,70-91,97-115                                                                                                                                         
  error.middleware.ts              |   55.55 |        0 |       0 |   55.55 | 20-24                                                                                                                                                            
  logger.middleware.ts             |     100 |    71.42 |     100 |     100 | 11-24                                                                                                                                                            
  message-rate-limit.middleware.ts |       0 |        0 |       0 |       0 | 7-166                                                                                                                                                            
  tracing.middleware.ts            |   60.52 |    42.85 |   42.85 |   60.52 | 37-38,40-41,50-53,61-67,71-72,77-78                                                                                                                              
  uuid-validation.middleware.ts    |       0 |        0 |       0 |       0 | 3-66                                                                                                                                                             
  validate-dto.middleware.ts       |       0 |        0 |       0 |       0 | 2-118                                                                                                                                                            
  validate.middleware.ts           |   44.64 |    13.04 |   46.15 |   40.81 | 23-31,37,43-69,88-103,117-134                                                                                                                                    
 models                            |   45.12 |       10 |    9.63 |   43.14 |                                                                                                                                                                  
  assignment-submission.model.ts   |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  assignment.model.ts              |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  associations-extended.ts         |       0 |      100 |       0 |       0 | 8-285                                                                                                                                                            
  associations.ts                  |       0 |      100 |       0 |       0 | 6-398                                                                                                                                                            
  category.model.ts                |   47.05 |        0 |       0 |   47.05 | 108,115-163                                                                                                                                                      
  chat-message.model.ts            |    87.5 |      100 |       0 |    87.5 | 85                                                                                                                                                               
  comment-moderation.model.ts      |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  course-statistics.model.ts       |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  course.model.ts                  |     100 |       75 |     100 |     100 | 68-129                                                                                                                                                           
  enrollment.model.ts              |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  final-grade.model.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  grade-component.model.ts         |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  grade.model.ts                   |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  index.ts                         |   98.66 |       50 |   20.68 |   97.87 | 58                                                                                                                                                               
  lesson-material.model.ts         |      40 |        0 |       0 |    42.1 | 109-117,124-142                                                                                                                                                  
  lesson-progress.model.ts         |   20.51 |        0 |       0 |   21.62 | 128-158,165-219                                                                                                                                                  
  lesson.model.ts                  |   25.92 |        0 |       0 |   25.92 | 121-134,140-170                                                                                                                                                  
  live-session-attendance.model.ts |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  live-session-message.model.ts    |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  live-session.model.ts            |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  livestream-policy.model.ts       |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  notification-recipient.model.ts  |   16.12 |        0 |       0 |   17.54 | 118-156,179-288                                                                                                                                                  
  notification.model.ts            |   38.09 |        0 |       0 |   38.09 | 145-161,168-212                                                                                                                                                  
  password-reset-token.model.ts    |       0 |        0 |       0 |       0 | 1-119                                                                                                                                                            
  quiz-answer.model.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  quiz-attempt.model.ts            |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  quiz-option.model.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  quiz-question.model.ts           |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  quiz.model.ts                    |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  review.model.ts                  |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  section.model.ts                 |      28 |        0 |       0 |      28 | 86-99,106-133                                                                                                                                                    
  user-activity-log.model.ts       |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  user.model.ts                    |     100 |      100 |     100 |     100 |                                                                                                                                                                  
 modules/ai                        |    27.2 |     1.35 |   18.75 |   25.56 |                                                                                                                                                                  
  ai.controller.ts                 |      20 |        0 |   16.66 |      20 | 29-51,60-79,88-101,110-123,132-141                                                                                                                               
  ai.routes.ts                     |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  ai.service.ts                    |   11.94 |     1.78 |   14.28 |   11.94 | 27-34,45-228                                                                                                                                                     
  index.ts                         |     100 |      100 |   33.33 |     100 |                                                                                                                                                                  
 modules/analytics                 |      48 |        0 |   15.38 |   53.33 |                                                                                                                                                                  
  analytics.controller.ts          |   35.29 |        0 |   33.33 |   35.29 | 13-18,23-29                                                                                                                                                      
  analytics.repository.ts          |      50 |        0 |       0 |      50 | 5-9                                                                                                                                                              
  analytics.routes.ts              |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  analytics.service.ts             |      60 |        0 |   33.33 |      60 | 11-15                                                                                                                                                            
  analytics.validate.ts            |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  index.ts                         |       0 |      100 |       0 |       0 | 2-7                                                                                                                                                              
 modules/assignment                |   14.55 |        0 |    4.34 |   14.98 |                                                                                                                                                                  
  assignment.controller.ts         |   16.05 |        0 |    5.88 |   16.05 | 22-32,40-58,66-76,84-97,105-117,129-146,154-167,179-189,197-216,224-237,245-264,272-285,293-306,318-328,336-349,357-371                                          
  assignment.repository.ts         |    5.47 |        0 |    4.34 |    5.79 | 21-454                                                                                                                                                           
  assignment.routes.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  assignment.service.ts            |    3.59 |        0 |    4.54 |    3.65 | 21-357                                                                                                                                                           
  assignment.validate.ts           |      50 |        0 |       0 |      50 | 6-7                                                                                                                                                              
  index.ts                         |       0 |      100 |       0 |       0 | 2-7                                                                                                                                                              
 modules/auth                      |   12.94 |     3.09 |      10 |   12.72 |                                                                                                                                                                  
  auth.controller.ts               |    7.87 |        0 |    12.5 |    7.87 | 17-46,57-249                                                                                                                                                     
  auth.repository.ts               |   11.53 |     4.76 |   18.18 |   11.53 | 22-23,37,44-45,72-469                                                                                                                                            
  auth.routes.ts                   |      65 |      100 |    6.66 |      65 | 27,35,42,48,56,64,75,81,87,93,100,108,115,122                                                                                                                    
  auth.service.ts                  |    8.45 |     3.63 |   11.76 |    8.72 | 34,41,47,53,70-677                                                                                                                                               
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
  chat.gateway.ts                  |       0 |        0 |       0 |       0 | 7-507                                                                                                                                                            
  chat.repository.ts               |       0 |        0 |       0 |       0 | 6-385                                                                                                                                                            
  chat.routes.ts                   |       0 |      100 |     100 |       0 | 6-70                                                                                                                                                             
  chat.service.ts                  |       0 |        0 |       0 |       0 | 6-176                                                                                                                                                            
  chat.types.ts                    |       0 |        0 |       0 |       0 | 152-192                                                                                                                                                          
  index.ts                         |       0 |      100 |       0 |       0 | 6-11                                                                                                                                                             
 modules/course                    |    15.7 |     3.41 |    8.33 |   16.01 |                                                                                                                                                                  
  course.admin.controller.ts       |    9.25 |        0 |    9.09 |    9.25 | 34-277                                                                                                                                                           
  course.admin.routes.ts           |   66.66 |      100 |       0 |   66.66 | 24,33,42,51,62,71,80,89,98,107                                                                                                                                   
  course.controller.ts             |      19 |        0 |   15.38 |      19 | 30,36-62,68-78,84-99,105-120,126-146,152-175,181-204,210-226,232-247,253-269,275-292                                                                             
  course.repository.ts             |    5.33 |        0 |    7.31 |    5.47 | 33-686                                                                                                                                                           
  course.routes.ts                 |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  course.service.ts                |   13.88 |    12.12 |   23.07 |   13.98 | 29,45,53-60,66,76-339                                                                                                                                            
  course.validate.ts               |       0 |        0 |       0 |       0 | 1-231                                                                                                                                                            
  index.ts                         |       0 |      100 |       0 |       0 | 7-53                                                                                                                                                             
 modules/course-content            |   13.75 |        0 |    3.29 |   14.17 |                                                                                                                                                                  
  course-content.controller.ts     |   15.33 |        0 |    4.54 |   15.33 | 26-40,49-66,75-86,95-108,117-129,138-151,164-178,187-199,208-221,230-242,251-264,277-291,300-322,331-343,352-363,376-389,398-410,419-431,440-452,461-473,486-503 
  course-content.repository.ts     |     3.3 |        0 |    3.03 |    3.57 | 51-432                                                                                                                                                           
  course-content.routes.ts         |   94.11 |        0 |       0 |   94.11 | 150-151                                                                                                                                                          
  course-content.service.ts        |    4.32 |        0 |    3.33 |    4.34 | 35-530                                                                                                                                                           
  course-content.validate.ts       |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  index.ts                         |       0 |      100 |       0 |       0 | 2-7                                                                                                                                                              
 modules/enrollment                |   10.58 |        0 |     3.7 |   10.98 |                                                                                                                                                                  
  enrollment.controller.ts         |    4.23 |        0 |    5.88 |    4.23 | 20-299                                                                                                                                                           
  enrollment.repository.ts         |    5.22 |        0 |       4 |    5.78 | 20-367                                                                                                                                                           
  enrollment.routes.ts             |    62.5 |      100 |       0 |    62.5 | 21,28,35,44,52,60,69,78,87,94,102,110,119,127,134                                                                                                                
  enrollment.service.ts            |    4.92 |        0 |    5.26 |    5.03 | 7-8,30-351                                                                                                                                                       
  enrollment.validate.ts           |      30 |        0 |       0 |      30 | 28-130                                                                                                                                                           
 modules/files                     |   26.09 |    18.39 |   17.39 |   25.52 |                                                                                                                                                                  
  files.controller.ts              |   12.96 |        0 |    8.33 |   12.96 | 25-44,53-77,86-112,121-147,156-169,178-191,200-212,221-233,242-259                                                                                               
  files.routes.ts                  |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  files.service.ts                 |   10.32 |    13.88 |    6.66 |   10.38 | 38-43,50-469                                                                                                                                                     
  files.types.ts                   |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  index.ts                         |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  media.controller.ts              |   18.18 |        0 |      20 |   18.18 | 32-56,65-100,109-134,143-181                                                                                                                                     
  media.routes.ts                  |   65.21 |        0 |       0 |   65.21 | 23-27,38-42                                                                                                                                                      
  upload.middleware.ts             |    31.5 |    37.87 |    12.5 |   29.57 | 35-61,76-104,155-203,212-234                                                                                                                                     
 modules/grade                     |   14.41 |        0 |    5.88 |   15.16 |                                                                                                                                                                  
  grade.controller.ts              |   31.81 |      100 |      25 |   31.81 | 13-18,23-28,33-38                                                                                                                                                
  grade.repository.ts              |    9.75 |        0 |    4.16 |      10 | 23-110                                                                                                                                                           
  grade.routes.ts                  |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  grade.service.ts                 |    4.51 |        0 |    5.55 |    4.68 | 20-293                                                                                                                                                           
  grade.validate.ts                |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  index.ts                         |       0 |      100 |       0 |       0 | 2-7                                                                                                                                                              
 modules/lesson                    |   23.77 |        0 |   13.04 |   24.28 |                                                                                                                                                                  
  lesson.controller.ts             |   15.38 |        0 |   16.66 |   15.38 | 18-121                                                                                                                                                           
  lesson.repository.ts             |   19.23 |        0 |      25 |   21.73 | 13-71                                                                                                                                                            
  lesson.routes.ts                 |      75 |      100 |       0 |      75 | 20,27,35,44,52                                                                                                                                                   
  lesson.service.ts                |   11.11 |        0 |   16.66 |   11.11 | 23-122                                                                                                                                                           
  lesson.validate.ts               |      50 |        0 |       0 |      50 | 6-7                                                                                                                                                              
 modules/livestream                |   11.22 |     1.17 |    4.44 |   11.35 |                                                                                                                                                                  
  index.ts                         |       0 |      100 |       0 |       0 | 2-8                                                                                                                                                              
  livestream.controller.ts         |   18.75 |        0 |    8.33 |   18.75 | 14-19,24-34,39-50,55-60,65-79,84-90,95-101,106-111,116-121,126-136,146-150                                                                                       
  livestream.gateway.ts            |       0 |        0 |       0 |       0 | 7-674                                                                                                                                                            
  livestream.repository.ts         |    9.09 |        0 |       0 |    9.67 | 13-133                                                                                                                                                           
  livestream.routes.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  livestream.service.ts            |   15.17 |      3.1 |   10.71 |   14.89 | 46-347,364-371,378-465                                                                                                                                           
  livestream.types.ts              |       0 |        0 |       0 |       0 | 59-91                                                                                                                                                            
  livestream.validate.ts           |    7.69 |        0 |       0 |    8.69 | 8-70                                                                                                                                                             
 modules/moderation                |   14.64 |        0 |   10.52 |   14.94 |                                                                                                                                                                  
  moderation.controller.ts         |   10.58 |        0 |    9.09 |   11.11 | 17-22,30-82,90-163,171-200,208-221                                                                                                                               
  moderation.routes.ts             |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  moderation.service.ts            |       7 |        0 |    12.5 |       7 | 40-497                                                                                                                                                           
 modules/notifications             |   19.94 |     1.06 |    5.12 |   21.44 |                                                                                                                                                                  
  index.ts                         |       0 |      100 |       0 |       0 | 2-7                                                                                                                                                              
  notifications.controller.ts      |   19.04 |        0 |    7.69 |   19.04 | 17-22,30-40,48-73,81-86,94-99,107-113,121-127,135-141,149-154,162-167,175-187,195-206                                                                            
  notifications.gateway.ts         |   21.91 |    14.28 |       5 |   21.91 | 64-242,251,255                                                                                                                                                   
  notifications.repository.ts      |   10.81 |        0 |    4.34 |   13.18 | 25-367                                                                                                                                                           
  notifications.routes.ts          |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  notifications.service.ts         |    7.93 |        0 |    6.25 |    7.93 | 18-267                                                                                                                                                           
  notifications.validate.ts        |   42.85 |        0 |       0 |      50 | 6-9                                                                                                                                                              
 modules/quiz                      |     8.1 |        0 |    2.02 |    8.57 |                                                                                                                                                                  
  index.ts                         |       0 |      100 |       0 |       0 | 2-7                                                                                                                                                              
  quiz.controller.ts               |       5 |        0 |    6.66 |       5 | 18-356                                                                                                                                                           
  quiz.repository.ts               |     3.7 |        0 |       0 |    4.61 | 14-372                                                                                                                                                           
  quiz.routes.ts                   |   63.15 |      100 |       0 |   63.15 | 20,27,35,44,52,61,68,77,86,94,103,111,118,125                                                                                                                    
  quiz.service.ts                  |    2.39 |        0 |    2.85 |    2.45 | 21-502                                                                                                                                                           
  quiz.validate.ts                 |      40 |        0 |       0 |      40 | 6-34                                                                                                                                                             
 modules/review                    |   20.34 |        0 |   10.71 |   20.34 |                                                                                                                                                                  
  review.controller.ts             |   19.35 |        0 |    12.5 |   19.35 | 21-32,40-57,65-76,84-97,105-120,128-142,150-163                                                                                                                  
  review.repository.ts             |      12 |        0 |      10 |      12 | 16-131                                                                                                                                                           
  review.routes.ts                 |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  review.service.ts                |    7.14 |        0 |      10 |    7.14 | 21-180                                                                                                                                                           
 modules/section                   |   26.31 |        0 |   13.63 |   26.71 |                                                                                                                                                                  
  section.controller.ts            |   15.38 |        0 |   16.66 |   15.38 | 18-120                                                                                                                                                           
  section.repository.ts            |      30 |        0 |   33.33 |   33.33 | 14-67                                                                                                                                                            
  section.routes.ts                |      75 |      100 |       0 |      75 | 20,27,35,44,52                                                                                                                                                   
  section.service.ts               |      12 |        0 |   16.66 |      12 | 22-114                                                                                                                                                           
  section.validate.ts              |      50 |        0 |       0 |      50 | 6-7                                                                                                                                                              
 modules/system-settings           |   52.83 |       50 |   33.33 |    54.9 |                                                                                                                                                                  
  system.settings.controller.ts    |   26.31 |        0 |   33.33 |   26.31 | 14-41                                                                                                                                                            
  system.settings.routes.ts        |   84.61 |      100 |       0 |     100 |                                                                                                                                                                  
  system.settings.service.ts       |   57.14 |      100 |      50 |   57.14 | 41-54                                                                                                                                                            
 modules/user                      |   13.46 |        0 |    6.14 |   12.82 |                                                                                                                                                                  
  index.ts                         |     100 |      100 |      60 |     100 |                                                                                                                                                                  
  user.admin.controller.ts         |    6.61 |        0 |    6.66 |    6.61 | 32-343                                                                                                                                                           
  user.admin.routes.ts             |   65.62 |      100 |       0 |   65.62 | 29,41,53,65,77,93,106,118,131,140,149                                                                                                                            
  user.controller.ts               |     5.2 |        0 |    7.14 |     5.2 | 21-207                                                                                                                                                           
  user.repository.ts               |    2.68 |        0 |    5.26 |    2.68 | 57-485                                                                                                                                                           
  user.routes.ts                   |    57.4 |        0 |       0 |    57.4 | 24-27,43-47,57-61,68,75,81,87,95,101,106,113,119,126,133,146                                                                                                     
  user.service.ts                  |    4.93 |        0 |    5.26 |    4.96 | 26-428                                                                                                                                                           
  user.validate.ts                 |       0 |        0 |       0 |       0 | 1-369                                                                                                                                                            
 modules/webrtc                    |       0 |        0 |       0 |       0 |                                                                                                                                                                  
  index.ts                         |       0 |      100 |     100 |       0 | 6-8                                                                                                                                                              
  webrtc.gateway.ts                |       0 |        0 |       0 |       0 | 7-579                                                                                                                                                            
  webrtc.service.ts                |       0 |        0 |       0 |       0 | 6-164                                                                                                                                                            
  webrtc.types.ts                  |       0 |        0 |       0 |       0 | 27-166                                                                                                                                                           
 monitoring                        |   94.73 |      100 |      40 |      90 |                                                                                                                                                                  
  index.ts                         |     100 |      100 |   44.44 |     100 |                                                                                                                                                                  
  ping.routes.ts                   |      80 |      100 |       0 |      80 | 28                                                                                                                                                               
 monitoring/health                 |   22.35 |        0 |   11.11 |   20.95 |                                                                                                                                                                  
  health.controller.ts             |   23.07 |        0 |   11.11 |   23.07 | 23-28,37-42,51-60,69-78,87-96,105-114,123-128,137-142                                                                                                            
  health.routes.ts                 |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  health.service.ts                |    7.07 |        0 |    6.66 |    7.07 | 131-432                                                                                                                                                          
  index.ts                         |     100 |      100 |   33.33 |     100 |                                                                                                                                                                  
 monitoring/metrics                |   26.57 |    24.01 |   18.57 |   27.01 |                                                                                                                                                                  
  background-tasks.metrics.ts      |       0 |        0 |       0 |       0 | 7-318                                                                                                                                                            
  database.metrics.ts              |       0 |        0 |       0 |       0 | 8-235                                                                                                                                                            
  index.ts                         |     100 |      100 |      40 |     100 |                                                                                                                                                                  
  metrics.controller.ts            |   10.21 |        0 |     3.7 |   10.38 | 36-40,49-53,62-78,87-103,112-131,140-159,168-178,187-191,200-209,218-227,236-245,254-265,274-382                                                                 
  metrics.middleware.ts            |   64.21 |    44.26 |   39.13 |   71.76 | 49,88,96,145-167,176,183,190,205,212,226,233,246-255                                                                                                             
  metrics.routes.ts                |     100 |       50 |     100 |     100 | 14-324                                                                                                                                                           
  metrics.service.ts               |   49.32 |    45.56 |      40 |    50.7 | 103,161,185,217,238-397,411,438-441,459-470,478,488-515                                                                                                          
  redis.metrics.ts                 |       0 |        0 |       0 |       0 | 8-292                                                                                                                                                            
 repositories                      |   13.11 |     9.52 |   10.14 |    11.3 |                                                                                                                                                                  
  base.repository.ts               |   13.51 |    18.75 |   22.22 |   13.51 | 53-77,92,99-393                                                                                                                                                  
  enrollment.repository.ts         |       0 |        0 |       0 |       0 | 2-245                                                                                                                                                            
  index.ts                         |       0 |      100 |       0 |       0 | 7-40                                                                                                                                                             
  user.repository.ts               |   19.78 |     4.54 |    8.82 |   15.72 | 32,39-492                                                                                                                                                        
 routes                            |       0 |      100 |     100 |       0 |                                                                                                                                                                  
  user.routes.ts                   |       0 |      100 |     100 |       0 | 9-12                                                                                                                                                             
 services/global                   |   12.18 |      2.2 |    10.6 |    11.4 |                                                                                                                                                                  
  account-lockout.service.ts       |   13.95 |        0 |      20 |   14.28 | 15-94                                                                                                                                                            
  auth.service.ts                  |   18.75 |      100 |   14.28 |   18.75 | 13-78                                                                                                                                                            
  cache.service.ts                 |   12.64 |    11.76 |   18.75 |   12.19 | 24-97,107-184                                                                                                                                                    
  email.service.ts                 |    6.81 |        0 |   14.28 |    6.81 | 22-174                                                                                                                                                           
  file.service.ts                  |    9.09 |        0 |      20 |    9.09 | 45-157                                                                                                                                                           
  index.ts                         |   96.87 |      100 |       0 |     100 |                                                                                                                                                                  
  password-security.service.ts     |   35.55 |    33.33 |   42.85 |   36.36 | 16,20,53-54,67-95,113-130                                                                                                                                        
  session-management.service.ts    |    7.21 |        0 |    6.66 |    7.52 | 28-231                                                                                                                                                           
  two-factor.service.ts            |    6.77 |        0 |    9.09 |     7.2 | 17-225                                                                                                                                                           
  user-refactored.service.ts       |       0 |        0 |       0 |       0 | 1-369                                                                                                                                                            
  user.service.ts                  |    5.88 |        0 |    8.33 |    6.09 | 80-159,176-486                                                                                                                                                   
 services/media                    |      25 |        0 |      20 |      30 |                                                                                                                                                                  
  cloudinary.service.ts            |      25 |        0 |      20 |      30 | 16-41                                                                                                                                                            
 services/storage                  |   23.64 |    19.04 |   14.28 |   23.97 |                                                                                                                                                                  
  gcs.service.ts                   |     7.5 |        0 |       0 |     7.5 | 11-103                                                                                                                                                           
  google-drive.service.ts          |   27.69 |    27.77 |   28.57 |   28.57 | 41,62-206,217-219                                                                                                                                                
  r2.service.ts                    |   28.57 |    13.33 |      20 |   28.57 | 26-107                                                                                                                                                           
  storage.factory.ts               |      50 |        0 |       0 |      50 | 13-19                                                                                                                                                            
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
 utils                             |   14.64 |     2.67 |    6.14 |   15.09 |                                                                                                                                                                  
  bcrypt.util.ts                   |   14.28 |       10 |   14.28 |   14.28 | 20-130                                                                                                                                                           
  constants.util.ts                |     100 |      100 |     100 |     100 |                                                                                                                                                                  
  date.util.ts                     |    6.61 |     1.92 |    2.85 |    6.61 | 20-34,57-311                                                                                                                                                     
  file.util.ts                     |    6.12 |        0 |       0 |    6.25 | 29-286                                                                                                                                                           
  hash.util.ts                     |   29.23 |        0 |    3.44 |   29.23 | 26-325                                                                                                                                                           
  index.ts                         |     100 |      100 |    12.5 |     100 |                                                                                                                                                                  
  jwt.util.ts                      |   28.57 |        0 |      15 |   28.57 | 72-73,89-223,243-270                                                                                                                                             
  logger.util.ts                   |   33.33 |    13.95 |      20 |   35.13 | 126-137,142-145,150,154,158,181-265                                                                                                                              
  message-delivery.util.ts         |       0 |        0 |       0 |       0 | 32-123                                                                                                                                                           
  model-extension.util.ts          |   45.16 |    10.71 |   23.52 |   45.16 | 17-20,41,56,125-128,139-146,161,171,185-186,196-197,208,218-219,233-240,255,264-267                                                                              
  object.util.ts                   |    0.46 |        0 |       0 |    0.53 | 11-375                                                                                                                                                           
  pagination.util.ts               |    1.85 |        0 |       0 |    1.88 | 46-235                                                                                                                                                           
  response.util.ts                 |   32.65 |     5.76 |    9.52 |   33.33 | 35-126,145-249                                                                                                                                                   
  role.util.ts                     |    3.44 |        0 |       0 |    3.84 | 15-178                                                                                                                                                           
  secure.util.ts                   |    5.76 |        0 |       0 |       6 | 16-149                                                                                                                                                           
  token.util.ts                    |   17.09 |     3.03 |   18.18 |   17.54 | 100-101,118,127-128,154-365,381-504                                                                                                                              
  type.util.ts                     |       0 |        0 |       0 |       0 | 7-319                                                                                                                                                            
  user.util.ts                     |   10.25 |     1.38 |    5.26 |   10.52 | 131-390                                                                                                                                                          
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
  auth.validate.ts                 |   17.24 |        0 |       0 |   17.24 | 35-52,84-141                                                                                                                                                     
  base.validate.ts                 |   32.14 |        0 |   17.64 |   32.14 | 60-81,181-256                                                                                                                                                    
  course.validate.ts               |   41.66 |        0 |       0 |   41.66 | 118-141                                                                                                                                                          
  file.validate.ts                 |       0 |        0 |       0 |       0 | 1-88                                                                                                                                                             
  index.ts                         |       0 |      100 |       0 |       0 | 7-53                                                                                                                                                             
  user.validate.ts                 |   35.71 |        0 |       0 |   35.71 | 99-114,215-238                                                                                                                                                   
-----------------------------------|---------|----------|---------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------
Jest: "global" coverage threshold for branches (9%) not met: 6.07%
Jest: "global" coverage threshold for functions (10%) not met: 7.79%
Test Suites: 4 failed, 4 total
Tests:       35 failed, 35 total
Snapshots:   0 total
Time:        33.726 s
Ran all test suites matching e2e.
Error: Process completed with exit code 1.