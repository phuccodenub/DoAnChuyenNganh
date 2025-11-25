Run e2e tests with PostgreSQL (hard-fail) : 
Run npm run test:e2e

> backend@1.0.0 test:e2e
> cross-env TEST_CATEGORY=integration E2E_SUITE=true jest --config jest.config.js --testPathPatterns=e2e --detectOpenHandles --runInBand

FAIL src/tests/e2e/course-enrollment.e2e.test.ts
  ● Test suite failed to run

    Google Drive OAuth2 is not fully configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI and GOOGLE_REFRESH_TOKEN.

      39 |
      40 |     if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
    > 41 |       throw new Error(
         |             ^
      42 |         'Google Drive OAuth2 is not fully configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI and GOOGLE_REFRESH_TOKEN.'
      43 |       );
      44 |     }

      at new GoogleDriveService (src/services/storage/google-drive.service.ts:41:13)
      at new CourseContentService (src/modules/course-content/course-content.service.ts:20:25)
      at new CourseContentController (src/modules/course-content/course-content.controller.ts:14:20)
      at Object.<anonymous> (src/modules/course-content/course-content.routes.ts:10:20)
      at Object.require (src/api/v1/routes/index.ts:21:1)
      at Object.require (src/api/v1/index.ts:6:1)
      at Object.require (src/api/routes.ts:8:1)
      at Object.require (src/api/index.ts:6:1)
      at Object.<anonymous> (src/app.ts:25:1)
      at Object.<anonymous> (src/tests/e2e/course-enrollment.e2e.test.ts:7:1)

FAIL src/tests/e2e/course-registration.e2e.test.ts
  ● Test suite failed to run

    Google Drive OAuth2 is not fully configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI and GOOGLE_REFRESH_TOKEN.

      39 |
      40 |     if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
    > 41 |       throw new Error(
         |             ^
      42 |         'Google Drive OAuth2 is not fully configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI and GOOGLE_REFRESH_TOKEN.'
      43 |       );
      44 |     }

      at new GoogleDriveService (src/services/storage/google-drive.service.ts:41:13)
      at new CourseContentService (src/modules/course-content/course-content.service.ts:20:25)
      at new CourseContentController (src/modules/course-content/course-content.controller.ts:14:20)
      at Object.<anonymous> (src/modules/course-content/course-content.routes.ts:10:20)
      at Object.require (src/api/v1/routes/index.ts:21:1)
      at Object.require (src/api/v1/index.ts:6:1)
      at Object.require (src/api/routes.ts:8:1)
      at Object.require (src/api/index.ts:6:1)
      at Object.<anonymous> (src/app.ts:25:1)
      at Object.<anonymous> (src/tests/e2e/course-registration.e2e.test.ts:7:1)

FAIL src/tests/e2e/health.e2e.test.ts
  ● Test suite failed to run

    Google Drive OAuth2 is not fully configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI and GOOGLE_REFRESH_TOKEN.

      39 |
      40 |     if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
    > 41 |       throw new Error(
         |             ^
      42 |         'Google Drive OAuth2 is not fully configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI and GOOGLE_REFRESH_TOKEN.'
      43 |       );
      44 |     }

      at new GoogleDriveService (src/services/storage/google-drive.service.ts:41:13)
      at new CourseContentService (src/modules/course-content/course-content.service.ts:20:25)
      at new CourseContentController (src/modules/course-content/course-content.controller.ts:14:20)
      at Object.<anonymous> (src/modules/course-content/course-content.routes.ts:10:20)
      at Object.require (src/api/v1/routes/index.ts:21:1)
      at Object.require (src/api/v1/index.ts:6:1)
      at Object.require (src/api/routes.ts:8:1)
      at Object.require (src/api/index.ts:6:1)
      at Object.<anonymous> (src/app.ts:25:1)
      at Object.<anonymous> (src/tests/e2e/health.e2e.test.ts:2:1)

FAIL src/tests/e2e/metrics.e2e.test.ts
  ● Test suite failed to run

    Google Drive OAuth2 is not fully configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI and GOOGLE_REFRESH_TOKEN.

      39 |
      40 |     if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
    > 41 |       throw new Error(
         |             ^
      42 |         'Google Drive OAuth2 is not fully configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI and GOOGLE_REFRESH_TOKEN.'
      43 |       );
      44 |     }

      at new GoogleDriveService (src/services/storage/google-drive.service.ts:41:13)
      at new CourseContentService (src/modules/course-content/course-content.service.ts:20:25)
      at new CourseContentController (src/modules/course-content/course-content.controller.ts:14:20)
      at Object.<anonymous> (src/modules/course-content/course-content.routes.ts:10:20)
      at Object.require (src/api/v1/routes/index.ts:21:1)
      at Object.require (src/api/v1/index.ts:6:1)
      at Object.require (src/api/routes.ts:8:1)
      at Object.require (src/api/index.ts:6:1)
      at Object.<anonymous> (src/app.ts:25:1)
      at Object.<anonymous> (src/tests/e2e/metrics.e2e.test.ts:2:1)

-----------------------------------|---------|----------|---------|---------|-------------------
File                               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------------------------|---------|----------|---------|---------|-------------------
All files                          |       0 |        0 |       0 |       0 |                   
 api                               |       0 |        0 |       0 |       0 |                   
  index.ts                         |       0 |      100 |       0 |       0 | 6-9               
  routes.ts                        |       0 |        0 |       0 |       0 | 6-90              
 api/v1                            |       0 |      100 |       0 |       0 |                   
  index.ts                         |       0 |      100 |       0 |       0 | 6                 
 api/v1/routes                     |       0 |      100 |       0 |       0 |                   
  assignment.routes.ts             |       0 |      100 |     100 |       0 | 6-8               
  auth.routes.ts                   |       0 |      100 |     100 |       0 | 6-14              
  course.routes.ts                 |       0 |      100 |     100 |       0 | 6-8               
  enrollment.routes.ts             |       0 |      100 |     100 |       0 | 6-8               
  index.ts                         |       0 |      100 |       0 |       0 | 6-75              
  lesson.routes.ts                 |       0 |      100 |     100 |       0 | 6-8               
  quiz.routes.ts                   |       0 |      100 |     100 |       0 | 6-8               
  section.routes.ts                |       0 |      100 |     100 |       0 | 6-8               
  user.routes.ts                   |       0 |      100 |       0 |       0 | 6-19              
 api/v2                            |       0 |      100 |       0 |       0 |                   
  index.ts                         |       0 |      100 |       0 |       0 | 6                 
 api/v2/routes                     |       0 |      100 |       0 |       0 |                   
  auth.routes.ts                   |       0 |      100 |       0 |       0 | 6-37              
  index.ts                         |       0 |      100 |     100 |       0 | 6-16              
  user.routes.ts                   |       0 |      100 |       0 |       0 | 6-37              
 api/versioning                    |       0 |        0 |       0 |       0 |                   
  index.ts                         |       0 |      100 |       0 |       0 | 6-9               
  version.config.ts                |       0 |        0 |       0 |       0 | 6-145             
  version.manager.ts               |       0 |        0 |       0 |       0 | 7-393             
  version.routes.ts                |       0 |      100 |     100 |       0 | 6-126             
 cache                             |       0 |        0 |       0 |       0 |                   
  cache-configuration.manager.ts   |       0 |        0 |       0 |       0 | 6-546             
  cache-invalidation.manager.ts    |       0 |        0 |       0 |       0 | 6-560             
  cache-performance.analyzer.ts    |       0 |        0 |       0 |       0 | 6-343             
  cache.manager.ts                 |       0 |        0 |       0 |       0 | 6-475             
  cache.middleware.ts              |       0 |        0 |       0 |       0 | 7-387             
  cache.routes.ts                  |       0 |      100 |       0 |       0 | 6-492             
  enhanced-cache.middleware.ts     |       0 |        0 |       0 |       0 | 8-431             
  index.ts                         |       0 |      100 |       0 |       0 | 7-17              
 cache/strategies                  |       0 |        0 |       0 |       0 |                   
  hybrid.strategy.ts               |       0 |        0 |       0 |       0 | 6-423             
  memory.strategy.ts               |       0 |        0 |       0 |       0 | 6-496             
  redis.strategy.ts                |       0 |        0 |       0 |       0 | 6-397             
 config                            |       0 |        0 |       0 |       0 |                   
  cors.config.ts                   |       0 |        0 |       0 |       0 | 1-20              
  db.ts                            |       0 |        0 |       0 |       0 | 1-103             
  env.config.ts                    |       0 |        0 |       0 |       0 | 1-147             
  index.ts                         |       0 |      100 |     100 |       0 | 2-5               
  jwt.config.ts                    |       0 |        0 |       0 |       0 | 2-29              
  mail.config.ts                   |       0 |        0 |       0 |       0 | 1-106             
  redis.config.ts                  |       0 |        0 |       0 |       0 | 1-86              
  swagger.config.ts                |       0 |      100 |       0 |       0 | 1-4               
 constants                         |       0 |        0 |       0 |       0 |                   
  app.constants.ts                 |       0 |        0 |       0 |       0 | 2-75              
  response.constants.ts            |       0 |      100 |     100 |       0 | 2                 
  roles.enum.ts                    |       0 |        0 |       0 |       0 | 2-85              
  user.constants.ts                |       0 |      100 |     100 |       0 | 2-65              
 errors                            |       0 |        0 |       0 |       0 |                   
  api.error.ts                     |       0 |        0 |       0 |       0 | 6-198             
  authentication.error.ts          |       0 |        0 |       0 |       0 | 6-203             
  authorization.error.ts           |       0 |        0 |       0 |       0 | 6-188             
  base.error.ts                    |       0 |        0 |       0 |       0 | 21-162            
  database.error.ts                |       0 |        0 |       0 |       0 | 6-289             
  error.constants.ts               |       0 |      100 |     100 |       0 | 7-151             
  error.factory.ts                 |       0 |        0 |       0 |       0 | 6-306             
  error.handler.ts                 |       0 |        0 |       0 |       0 | 9-230             
  error.utils.ts                   |       0 |        0 |       0 |       0 | 6-275             
  external-service.error.ts        |       0 |        0 |       0 |       0 | 6-238             
  file.error.ts                    |       0 |        0 |       0 |       0 | 6-211             
  index.ts                         |       0 |      100 |       0 |       0 | 7-29              
  validation.error.ts              |       0 |        0 |       0 |       0 | 6-185             
 middlewares                       |       0 |        0 |       0 |       0 |                   
  auth-rate-limit.middleware.ts    |       0 |        0 |       0 |       0 | 1-45              
  auth.middleware.ts               |       0 |        0 |       0 |       0 | 2-115             
  error.middleware.ts              |       0 |        0 |       0 |       0 | 7-24              
  logger.middleware.ts             |       0 |        0 |       0 |       0 | 2-50              
  message-rate-limit.middleware.ts |       0 |        0 |       0 |       0 | 7-166             
  tracing.middleware.ts            |       0 |        0 |       0 |       0 | 1-78              
  uuid-validation.middleware.ts    |       0 |        0 |       0 |       0 | 3-66              
  validate-dto.middleware.ts       |       0 |        0 |       0 |       0 | 2-118             
  validate.middleware.ts           |       0 |        0 |       0 |       0 | 2-134             
 models                            |       0 |        0 |       0 |       0 |                   
  assignment-submission.model.ts   |       0 |      100 |     100 |       0 | 1-56              
  assignment.model.ts              |       0 |      100 |     100 |       0 | 1-53              
  associations-extended.ts         |       0 |      100 |       0 |       0 | 8-285             
  associations.ts                  |       0 |      100 |       0 |       0 | 6-338             
  category.model.ts                |       0 |        0 |       0 |       0 | 1-167             
  chat-message.model.ts            |       0 |      100 |       0 |       0 | 1-106             
  course-statistics.model.ts       |       0 |      100 |     100 |       0 | 1-45              
  course.model.ts                  |       0 |        0 |       0 |       0 | 1-193             
  enrollment.model.ts              |       0 |      100 |     100 |       0 | 1-136             
  final-grade.model.ts             |       0 |      100 |     100 |       0 | 1-44              
  grade-component.model.ts         |       0 |      100 |     100 |       0 | 1-44              
  grade.model.ts                   |       0 |      100 |     100 |       0 | 1-60              
  index.ts                         |       0 |        0 |       0 |       0 | 2-55              
  lesson-material.model.ts         |       0 |        0 |       0 |       0 | 1-147             
  lesson-progress.model.ts         |       0 |        0 |       0 |       0 | 1-246             
  lesson.model.ts                  |       0 |        0 |       0 |       0 | 1-175             
  live-session-attendance.model.ts |       0 |      100 |     100 |       0 | 1-44              
  live-session-message.model.ts    |       0 |      100 |     100 |       0 | 1-52              
  live-session.model.ts            |       0 |      100 |     100 |       0 | 1-103             
  notification-recipient.model.ts  |       0 |        0 |       0 |       0 | 1-298             
  notification.model.ts            |       0 |        0 |       0 |       0 | 1-216             
  password-reset-token.model.ts    |       0 |        0 |       0 |       0 | 1-119             
  quiz-answer.model.ts             |       0 |      100 |     100 |       0 | 1-47              
  quiz-attempt.model.ts            |       0 |      100 |     100 |       0 | 1-51              
  quiz-option.model.ts             |       0 |      100 |     100 |       0 | 1-44              
  quiz-question.model.ts           |       0 |      100 |     100 |       0 | 1-49              
  quiz.model.ts                    |       0 |      100 |     100 |       0 | 1-62              
  section.model.ts                 |       0 |        0 |       0 |       0 | 1-138             
  user-activity-log.model.ts       |       0 |      100 |     100 |       0 | 1-42              
  user.model.ts                    |       0 |      100 |     100 |       0 | 1-118             
 modules/analytics                 |       0 |        0 |       0 |       0 |                   
  analytics.controller.ts          |       0 |        0 |       0 |       0 | 2-29              
  analytics.repository.ts          |       0 |        0 |       0 |       0 | 1-9               
  analytics.routes.ts              |       0 |      100 |     100 |       0 | 1-15              
  analytics.service.ts             |       0 |        0 |       0 |       0 | 1-15              
  analytics.validate.ts            |       0 |      100 |     100 |       0 | 1-3               
  index.ts                         |       0 |      100 |       0 |       0 | 2-7               
 modules/assignment                |       0 |        0 |       0 |       0 |                   
  assignment.controller.ts         |       0 |        0 |       0 |       0 | 2-165             
  assignment.repository.ts         |       0 |        0 |       0 |       0 | 1-216             
  assignment.routes.ts             |       0 |      100 |     100 |       0 | 1-30              
  assignment.service.ts            |       0 |        0 |       0 |       0 | 1-319             
  assignment.validate.ts           |       0 |        0 |       0 |       0 | 1-7               
  index.ts                         |       0 |      100 |       0 |       0 | 2-7               
 modules/auth                      |       0 |        0 |       0 |       0 |                   
  auth.controller.ts               |       0 |        0 |       0 |       0 | 2-214             
  auth.repository.ts               |       0 |        0 |       0 |       0 | 3-469             
  auth.routes.ts                   |       0 |      100 |       0 |       0 | 1-113             
  auth.service.ts                  |       0 |        0 |       0 |       0 | 1-613             
  auth.validate.ts                 |       0 |        0 |       0 |       0 | 1-450             
  index.ts                         |       0 |      100 |       0 |       0 | 2-5               
 modules/category                  |       0 |        0 |       0 |       0 |                   
  category.controller.ts           |       0 |        0 |       0 |       0 | 2-64              
  category.repository.ts           |       0 |        0 |       0 |       0 | 2-47              
  category.routes.ts               |       0 |      100 |     100 |       0 | 1-40              
  category.service.ts              |       0 |        0 |       0 |       0 | 2-53              
  category.validate.ts             |       0 |      100 |     100 |       0 | 1-3               
  index.ts                         |       0 |      100 |       0 |       0 | 1-6               
 modules/chat                      |       0 |        0 |       0 |       0 |                   
  chat.controller.ts               |       0 |        0 |       0 |       0 | 7-179             
  chat.gateway.ts                  |       0 |        0 |       0 |       0 | 7-507             
  chat.repository.ts               |       0 |        0 |       0 |       0 | 6-385             
  chat.routes.ts                   |       0 |      100 |     100 |       0 | 6-70              
  chat.service.ts                  |       0 |        0 |       0 |       0 | 6-176             
  chat.types.ts                    |       0 |        0 |       0 |       0 | 152-192           
  index.ts                         |       0 |      100 |       0 |       0 | 6-11              
 modules/course                    |       0 |        0 |       0 |       0 |                   
  course.controller.ts             |       0 |        0 |       0 |       0 | 2-240             
  course.repository.ts             |       0 |        0 |       0 |       0 | 1-353             
  course.routes.ts                 |       0 |      100 |     100 |       0 | 1-624             
  course.service.ts                |       0 |        0 |       0 |       0 | 5-259             
  course.validate.ts               |       0 |        0 |       0 |       0 | 1-231             
  index.ts                         |       0 |      100 |       0 |       0 | 7-53              
 modules/course-content            |       0 |        0 |       0 |       0 |                   
  course-content.controller.ts     |       0 |        0 |       0 |       0 | 2-503             
  course-content.repository.ts     |       0 |        0 |       0 |       0 | 1-432             
  course-content.routes.ts         |       0 |        0 |       0 |       0 | 1-229             
  course-content.service.ts        |       0 |        0 |       0 |       0 | 1-530             
  course-content.validate.ts       |       0 |      100 |     100 |       0 | 1-6               
  index.ts                         |       0 |      100 |       0 |       0 | 2-7               
 modules/enrollment                |       0 |        0 |       0 |       0 |                   
  enrollment.controller.ts         |       0 |        0 |       0 |       0 | 2-299             
  enrollment.repository.ts         |       0 |        0 |       0 |       0 | 2-367             
  enrollment.routes.ts             |       0 |      100 |       0 |       0 | 1-137             
  enrollment.service.ts            |       0 |        0 |       0 |       0 | 1-351             
  enrollment.validate.ts           |       0 |        0 |       0 |       0 | 1-130             
 modules/files                     |       0 |        0 |       0 |       0 |                   
  files.controller.ts              |       0 |        0 |       0 |       0 | 8-259             
  files.routes.ts                  |       0 |      100 |     100 |       0 | 6-80              
  files.service.ts                 |       0 |        0 |       0 |       0 | 6-469             
  files.types.ts                   |       0 |        0 |       0 |       0 | 78-184            
  index.ts                         |       0 |      100 |       0 |       0 | 6-10              
  upload.middleware.ts             |       0 |        0 |       0 |       0 | 6-234             
 modules/grade                     |       0 |        0 |       0 |       0 |                   
  grade.controller.ts              |       0 |      100 |       0 |       0 | 2-38              
  grade.repository.ts              |       0 |        0 |       0 |       0 | 1-110             
  grade.routes.ts                  |       0 |      100 |     100 |       0 | 1-32              
  grade.service.ts                 |       0 |        0 |       0 |       0 | 1-293             
  grade.validate.ts                |       0 |      100 |     100 |       0 | 1-3               
  index.ts                         |       0 |      100 |       0 |       0 | 2-7               
 modules/lesson                    |       0 |        0 |       0 |       0 |                   
  lesson.controller.ts             |       0 |        0 |       0 |       0 | 2-121             
  lesson.repository.ts             |       0 |        0 |       0 |       0 | 1-53              
  lesson.routes.ts                 |       0 |      100 |       0 |       0 | 1-55              
  lesson.service.ts                |       0 |        0 |       0 |       0 | 1-115             
  lesson.validate.ts               |       0 |        0 |       0 |       0 | 1-7               
 modules/livestream                |       0 |        0 |       0 |       0 |                   
  index.ts                         |       0 |      100 |       0 |       0 | 2-8               
  livestream.controller.ts         |       0 |        0 |       0 |       0 | 2-112             
  livestream.gateway.ts            |       0 |        0 |       0 |       0 | 7-551             
  livestream.repository.ts         |       0 |        0 |       0 |       0 | 1-133             
  livestream.routes.ts             |       0 |      100 |     100 |       0 | 1-60              
  livestream.service.ts            |       0 |        0 |       0 |       0 | 1-337             
  livestream.types.ts              |       0 |        0 |       0 |       0 | 59-91             
  livestream.validate.ts           |       0 |        0 |       0 |       0 | 1-70              
 modules/notifications             |       0 |        0 |       0 |       0 |                   
  index.ts                         |       0 |      100 |       0 |       0 | 2-7               
  notifications.controller.ts      |       0 |        0 |       0 |       0 | 2-80              
  notifications.repository.ts      |       0 |        0 |       0 |       0 | 1-134             
  notifications.routes.ts          |       0 |      100 |     100 |       0 | 1-37              
  notifications.service.ts         |       0 |        0 |       0 |       0 | 1-44              
  notifications.validate.ts        |       0 |      100 |     100 |       0 | 1-3               
 modules/quiz                      |       0 |        0 |       0 |       0 |                   
  index.ts                         |       0 |      100 |       0 |       0 | 2-7               
  quiz.controller.ts               |       0 |        0 |       0 |       0 | 2-356             
  quiz.repository.ts               |       0 |        0 |       0 |       0 | 1-372             
  quiz.routes.ts                   |       0 |      100 |       0 |       0 | 1-128             
  quiz.service.ts                  |       0 |        0 |       0 |       0 | 1-502             
  quiz.validate.ts                 |       0 |        0 |       0 |       0 | 1-34              
 modules/section                   |       0 |        0 |       0 |       0 |                   
  section.controller.ts            |       0 |        0 |       0 |       0 | 2-120             
  section.repository.ts            |       0 |        0 |       0 |       0 | 1-51              
  section.routes.ts                |       0 |      100 |       0 |       0 | 1-55              
  section.service.ts               |       0 |        0 |       0 |       0 | 1-114             
  section.validate.ts              |       0 |        0 |       0 |       0 | 1-7               
 modules/system-settings           |       0 |        0 |       0 |       0 |                   
  system.settings.controller.ts    |       0 |        0 |       0 |       0 | 2-41              
  system.settings.routes.ts        |       0 |      100 |       0 |       0 | 1-15              
  system.settings.service.ts       |       0 |        0 |       0 |       0 | 1-54              
 modules/user                      |       0 |        0 |       0 |       0 |                   
  index.ts                         |       0 |      100 |       0 |       0 | 2-13              
  user.admin.controller.ts         |       0 |        0 |       0 |       0 | 2-274             
  user.admin.routes.ts             |       0 |      100 |       0 |       0 | 1-152             
  user.controller.ts               |       0 |        0 |       0 |       0 | 2-207             
  user.repository.ts               |       0 |        0 |       0 |       0 | 3-485             
  user.routes.ts                   |       0 |        0 |       0 |       0 | 1-149             
  user.service.ts                  |       0 |        0 |       0 |       0 | 1-428             
  user.validate.ts                 |       0 |        0 |       0 |       0 | 1-369             
 modules/webrtc                    |       0 |        0 |       0 |       0 |                   
  index.ts                         |       0 |      100 |     100 |       0 | 6-8               
  webrtc.gateway.ts                |       0 |        0 |       0 |       0 | 7-579             
  webrtc.service.ts                |       0 |        0 |       0 |       0 | 6-164             
  webrtc.types.ts                  |       0 |        0 |       0 |       0 | 27-166            
 monitoring                        |       0 |      100 |       0 |       0 |                   
  index.ts                         |       0 |      100 |       0 |       0 | 7-15              
  ping.routes.ts                   |       0 |      100 |       0 |       0 | 6-31              
 monitoring/health                 |       0 |        0 |       0 |       0 |                   
  health.controller.ts             |       0 |        0 |       0 |       0 | 7-142             
  health.routes.ts                 |       0 |      100 |     100 |       0 | 6-315             
  health.service.ts                |       0 |        0 |       0 |       0 | 6-432             
  index.ts                         |       0 |      100 |       0 |       0 | 6-8               
 monitoring/metrics                |       0 |        0 |       0 |       0 |                   
  background-tasks.metrics.ts      |       0 |        0 |       0 |       0 | 7-318             
  database.metrics.ts              |       0 |        0 |       0 |       0 | 8-235             
  index.ts                         |       0 |      100 |       0 |       0 | 6-9               
  metrics.controller.ts            |       0 |        0 |       0 |       0 | 11-382            
  metrics.middleware.ts            |       0 |        0 |       0 |       0 | 7-258             
  metrics.routes.ts                |       0 |        0 |     100 |       0 | 6-328             
  metrics.service.ts               |       0 |        0 |       0 |       0 | 6-515             
  redis.metrics.ts                 |       0 |        0 |       0 |       0 | 8-292             
 repositories                      |       0 |        0 |       0 |       0 |                   
  base.repository.ts               |       0 |        0 |       0 |       0 | 3-393             
  enrollment.repository.ts         |       0 |        0 |       0 |       0 | 2-245             
  index.ts                         |       0 |      100 |       0 |       0 | 7-40              
  user.repository.ts               |       0 |        0 |       0 |       0 | 1-433             
 routes                            |       0 |      100 |     100 |       0 |                   
  user.routes.ts                   |       0 |      100 |     100 |       0 | 9-12              
 services/global                   |       0 |        0 |       0 |       0 |                   
  account-lockout.service.ts       |       0 |        0 |       0 |       0 | 1-94              
  auth.service.ts                  |       0 |      100 |       0 |       0 | 1-78              
  cache.service.ts                 |       0 |        0 |       0 |       0 | 1-184             
  email.service.ts                 |       0 |        0 |       0 |       0 | 1-174             
  file.service.ts                  |       0 |        0 |       0 |       0 | 1-157             
  index.ts                         |       0 |      100 |       0 |       0 | 7-63              
  password-security.service.ts     |       0 |        0 |       0 |       0 | 2-130             
  session-management.service.ts    |       0 |        0 |       0 |       0 | 1-231             
  two-factor.service.ts            |       0 |        0 |       0 |       0 | 1-225             
  user-refactored.service.ts       |       0 |        0 |       0 |       0 | 1-369             
  user.service.ts                  |       0 |        0 |       0 |       0 | 1-372             
 services/media                    |       0 |        0 |       0 |       0 |                   
  cloudinary.service.ts            |       0 |        0 |       0 |       0 | 1-41              
 services/storage                  |       0 |        0 |       0 |       0 |                   
  gcs.service.ts                   |       0 |        0 |       0 |       0 | 1-103             
  google-drive.service.ts          |       0 |        0 |       0 |       0 | 1-222             
  r2.service.ts                    |       0 |        0 |       0 |       0 | 1-107             
  storage.factory.ts               |       0 |        0 |       0 |       0 | 1-19              
 shared                            |       0 |      100 |     100 |       0 |                   
  index.ts                         |       0 |      100 |     100 |       0 | 4-6               
 shared/base                       |       0 |        0 |       0 |       0 |                   
  base.controller.ts               |       0 |        0 |       0 |       0 | 6-191             
 swagger/paths                     |       0 |      100 |     100 |       0 |                   
  assignment.paths.ts              |       0 |      100 |     100 |       0 | 1                 
  auth.paths.ts                    |       0 |      100 |     100 |       0 | 1                 
  chat.paths.ts                    |       0 |      100 |     100 |       0 | 1                 
  course.paths.ts                  |       0 |      100 |     100 |       0 | 1                 
  enrollment.paths.ts              |       0 |      100 |     100 |       0 | 1                 
  grade.paths.ts                   |       0 |      100 |     100 |       0 | 1                 
  lesson.paths.ts                  |       0 |      100 |     100 |       0 | 1                 
  live-session.paths.ts            |       0 |      100 |     100 |       0 | 1                 
  notification.paths.ts            |       0 |      100 |     100 |       0 | 1                 
  quiz.paths.ts                    |       0 |      100 |     100 |       0 | 1                 
  section.paths.ts                 |       0 |      100 |     100 |       0 | 1                 
  user.paths.ts                    |       0 |      100 |     100 |       0 | 1                 
 swagger/schemas                   |       0 |      100 |     100 |       0 |                   
  assignment.schema.ts             |       0 |      100 |     100 |       0 | 1                 
  auth.schema.ts                   |       0 |      100 |     100 |       0 | 1                 
  chat.schema.ts                   |       0 |      100 |     100 |       0 | 1                 
  course.schema.ts                 |       0 |      100 |     100 |       0 | 1                 
  enrollment.schema.ts             |       0 |      100 |     100 |       0 | 1                 
  grade.schema.ts                  |       0 |      100 |     100 |       0 | 1                 
  lesson.schema.ts                 |       0 |      100 |     100 |       0 | 1                 
  live-session.schema.ts           |       0 |      100 |     100 |       0 | 1                 
  notification.schema.ts           |       0 |      100 |     100 |       0 | 1                 
  quiz.schema.ts                   |       0 |      100 |     100 |       0 | 1                 
  section.schema.ts                |       0 |      100 |     100 |       0 | 1                 
  user.schema.ts                   |       0 |      100 |     100 |       0 | 1                 
 tracing                           |       0 |        0 |       0 |       0 |                   
  tracing.ts                       |       0 |        0 |       0 |       0 | 1-58              
 types                             |       0 |        0 |       0 |       0 |                   
  index.ts                         |       0 |      100 |       0 |       0 | 14-78             
  type-utilities.ts                |       0 |        0 |       0 |       0 | 18-581            
  user.types.ts                    |       0 |        0 |       0 |       0 | 139-151           
 types/dtos                        |       0 |        0 |       0 |       0 |                   
  enrollment.dto.ts                |       0 |        0 |       0 |       0 | 1-59              
  index.ts                         |       0 |      100 |     100 |       0 | 6-21              
 utils                             |       0 |        0 |       0 |       0 |                   
  bcrypt.util.ts                   |       0 |        0 |       0 |       0 | 1-130             
  constants.util.ts                |       0 |      100 |     100 |       0 | 7-212             
  date.util.ts                     |       0 |        0 |       0 |       0 | 17-311            
  file.util.ts                     |       0 |        0 |       0 |       0 | 1-286             
  hash.util.ts                     |       0 |        0 |       0 |       0 | 1-340             
  index.ts                         |       0 |      100 |       0 |       0 | 7-40              
  jwt.util.ts                      |       0 |        0 |       0 |       0 | 1-270             
  logger.util.ts                   |       0 |        0 |       0 |       0 | 1-269             
  message-delivery.util.ts         |       0 |        0 |       0 |       0 | 32-123            
  model-extension.util.ts          |       0 |        0 |       0 |       0 | 6-267             
  object.util.ts                   |       0 |        0 |       0 |       0 | 8-375             
  pagination.util.ts               |       0 |        0 |       0 |       0 | 34-235            
  response.util.ts                 |       0 |        0 |       0 |       0 | 2-264             
  role.util.ts                     |       0 |        0 |       0 |       0 | 7-178             
  secure.util.ts                   |       0 |        0 |       0 |       0 | 1-149             
  token.util.ts                    |       0 |        0 |       0 |       0 | 1-504             
  type.util.ts                     |       0 |        0 |       0 |       0 | 7-319             
  user.util.ts                     |       0 |        0 |       0 |       0 | 2-387             
  validators.util.ts               |       0 |        0 |       0 |       0 | 1-353             
 utils/string                      |       0 |        0 |       0 |       0 |                   
  crypto.util.ts                   |       0 |        0 |       0 |       0 | 1-382             
  extract.util.ts                  |       0 |        0 |       0 |       0 | 1-354             
  format.util.ts                   |       0 |        0 |       0 |       0 | 7-245             
  index.ts                         |       0 |      100 |     100 |       0 | 7-88              
  mask.util.ts                     |       0 |        0 |       0 |       0 | 5-275             
  normalize.util.ts                |       0 |        0 |       0 |       0 | 7-398             
 utils/tests                       |       0 |      100 |     100 |       0 |                   
  index.ts                         |       0 |      100 |     100 |       0 | 7-15              
 validates                         |       0 |        0 |       0 |       0 |                   
  auth.validate.ts                 |       0 |        0 |       0 |       0 | 1-146             
  base.validate.ts                 |       0 |        0 |       0 |       0 | 1-262             
  course.validate.ts               |       0 |        0 |       0 |       0 | 1-126             
  file.validate.ts                 |       0 |        0 |       0 |       0 | 1-88              
  index.ts                         |       0 |      100 |       0 |       0 | 7-53              
  user.validate.ts                 |       0 |        0 |       0 |       0 | 1-243             
-----------------------------------|---------|----------|---------|---------|-------------------
Jest: "global" coverage threshold for statements (15%) not met: 0%
Jest: "global" coverage threshold for branches (9%) not met: 0%
Jest: "global" coverage threshold for lines (15%) not met: 0%
Jest: "global" coverage threshold for functions (10%) not met: 0%
Test Suites: 4 failed, 4 total
Tests:       0 total
Snapshots:   0 total
Time:        36.39 s
Ran all test suites matching e2e.
Error: Process completed with exit code 1.