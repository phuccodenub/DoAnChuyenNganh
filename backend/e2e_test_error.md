Run npm run test:e2e

> backend@1.0.0 test:e2e
> jest --config jest.config.js --testPathPatterns=e2e --detectOpenHandles

FAIL src/tests/e2e/course-enrollment.e2e.test.ts (9.816 s)
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

      at startTracing (src/tracing/tracing.ts:45:15)

    console.log
      ✅ Model associations setup completed

      at setupAssociations (src/models/associations.ts:263:11)

    console.log
      ✅ Extended model associations setup completed

      at setupExtendedAssociations (src/models/associations-extended.ts:340:11)

  ● Course Enrollment E2E › POST /api/v1/enrollments › should enroll in course successfully

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)

  ● Course Enrollment E2E › POST /api/v1/enrollments › should fail to enroll without authentication

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)

  ● Course Enrollment E2E › POST /api/v1/enrollments › should fail to enroll in non-existent course

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)

  ● Course Enrollment E2E › POST /api/v1/enrollments › should fail to enroll twice in same course

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)

  ● Course Enrollment E2E › GET /api/v1/enrollments › should get user enrollments

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)

  ● Course Enrollment E2E › GET /api/v1/enrollments › should get enrollments with pagination

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)

  ● Course Enrollment E2E › GET /api/v1/enrollments › should filter enrollments by status

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)

  ● Course Enrollment E2E › GET /api/v1/enrollments/:id › should get enrollment by ID

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)

  ● Course Enrollment E2E › GET /api/v1/enrollments/:id › should return 404 for non-existent enrollment

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)

  ● Course Enrollment E2E › PUT /api/v1/enrollments/:id/progress › should update enrollment progress

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)

  ● Course Enrollment E2E › PUT /api/v1/enrollments/:id/progress › should fail to update progress without authentication

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)

  ● Course Enrollment E2E › PUT /api/v1/enrollments/:id/complete › should complete enrollment successfully

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)

  ● Course Enrollment E2E › PUT /api/v1/enrollments/:id/complete › should fail to complete enrollment without authentication

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)

  ● Course Enrollment E2E › DELETE /api/v1/enrollments/:id › should drop enrollment successfully

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)

  ● Course Enrollment E2E › DELETE /api/v1/enrollments/:id › should return 404 when dropping non-existent enrollment

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)

  ● Course Enrollment E2E › GET /api/v1/courses/:id/enrollments › should get course enrollments (instructor only)

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)

  ● Course Enrollment E2E › GET /api/v1/users/:id/enrollments › should get user enrollment history

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:38:28)


  ● Test suite failed to run

    TypeError: Cannot read properties of undefined (reading 'close')

      76 |     // Cleanup test database
      77 |     const sequelize = getSequelize();
    > 78 |     await sequelize.close();
         |                     ^
      79 |   });
      80 |
      81 |   describe('POST /api/v1/enrollments', () => {

      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:78:21)

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

      at startTracing (src/tracing/tracing.ts:45:15)

    console.log
      ✅ Model associations setup completed

      at setupAssociations (src/models/associations.ts:263:11)

    console.log
      ✅ Extended model associations setup completed

      at setupExtendedAssociations (src/models/associations-extended.ts:340:11)

  ● Course Registration E2E › POST /api/v1/courses › should create a new course successfully

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-registration.e2e.test.ts:38:28)

  ● Course Registration E2E › POST /api/v1/courses › should fail to create course without authentication

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-registration.e2e.test.ts:38:28)

  ● Course Registration E2E › POST /api/v1/courses › should fail to create course with invalid data

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-registration.e2e.test.ts:38:28)

  ● Course Registration E2E › GET /api/v1/courses › should get all courses

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-registration.e2e.test.ts:38:28)

  ● Course Registration E2E › GET /api/v1/courses › should get courses with pagination

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-registration.e2e.test.ts:38:28)

  ● Course Registration E2E › GET /api/v1/courses › should filter courses by category

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-registration.e2e.test.ts:38:28)

  ● Course Registration E2E › GET /api/v1/courses/:id › should get course by ID

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-registration.e2e.test.ts:38:28)

  ● Course Registration E2E › GET /api/v1/courses/:id › should return 404 for non-existent course

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-registration.e2e.test.ts:38:28)

  ● Course Registration E2E › PUT /api/v1/courses/:id › should update course successfully

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-registration.e2e.test.ts:38:28)

  ● Course Registration E2E › PUT /api/v1/courses/:id › should fail to update course without authentication

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-registration.e2e.test.ts:38:28)

  ● Course Registration E2E › DELETE /api/v1/courses/:id › should delete course successfully

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-registration.e2e.test.ts:38:28)

  ● Course Registration E2E › DELETE /api/v1/courses/:id › should return 404 when deleting non-existent course

    TypeError: Cannot read properties of undefined (reading 'getQueryInterface')

      146 |    */
      147 |   async initialize(): Promise<void> {
    > 148 |     const queryInterface = this.sequelize.getQueryInterface();
          |                                           ^
      149 |     
      150 |     try {
      151 |       await queryInterface.createTable('migrations', {

      at MigrationManager.initialize (src/migrations/index.ts:148:43)
      at MigrationManager.migrate (src/migrations/index.ts:223:16)
      at Object.<anonymous> (src/tests/e2e/course-registration.e2e.test.ts:38:28)


  ● Test suite failed to run

    TypeError: Cannot read properties of undefined (reading 'close')

      58 |     // Cleanup test database
      59 |     const sequelize = getSequelize();
    > 60 |     await sequelize.close();
         |                     ^
      61 |   });
      62 |
      63 |   describe('POST /api/v1/courses', () => {

      at Object.<anonymous> (src/tests/e2e/course-registration.e2e.test.ts:60:21)

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

      at startTracing (src/tracing/tracing.ts:45:15)

    console.log
      2025-11-14 20:48:07 [error]: Database connection check failed {
        "service": "lms-backend",
        "error": "Cannot read properties of undefined (reading 'authenticate')"
      } traceId=00000000000000000000000000000000 spanId=0000000000000000

      at Console.log (node_modules/winston/lib/winston/transports/console.js:87:23)

    console.log
      2025-11-14 20:48:07 [error]: Database health check failed {
        "service": "lms-backend",
        "error": "Cannot read properties of undefined (reading 'authenticate')"
      } traceId=00000000000000000000000000000000 spanId=0000000000000000

      at Console.log (node_modules/winston/lib/winston/transports/console.js:87:23)

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

      at startTracing (src/tracing/tracing.ts:45:15)

  ● E2E: Metrics endpoints › GET /metrics/prometheus should return text/plain and include baseline metrics

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      12 |   it('GET /metrics/prometheus should return text/plain and include baseline metrics', async () => {
      13 |     const res = await request(app).get('/metrics/prometheus');
    > 14 |     expect(res.status).toBe(200);
         |                        ^
      15 |     expect(res.headers['content-type']).toMatch(/text\/plain/);
      16 |     expect(res.text).toMatch(/# TYPE/);
      17 |   });

      at Object.<anonymous> (src/tests/e2e/metrics.e2e.test.ts:14:24)

  ● E2E: Metrics endpoints › GET /metrics should return json with success

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      19 |   it('GET /metrics should return json with success', async () => {
      20 |     const res = await request(app).get('/metrics');
    > 21 |     expect(res.status).toBe(200);
         |                        ^
      22 |     expect(res.body).toHaveProperty('success', true);
      23 |   });
      24 | });

      at Object.<anonymous> (src/tests/e2e/metrics.e2e.test.ts:21:24)

Test Suites: 3 failed, 1 passed, 4 total
Tests:       31 failed, 4 passed, 35 total
Snapshots:   0 total
Time:        13.286 s
Ran all test suites matching e2e.
Error: Process completed with exit code 1.