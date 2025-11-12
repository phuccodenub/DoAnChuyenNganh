lms-backend-dev  | 2025-11-10 15:04:07 [error]: Error checking suspicious activity: s.loginTime.getTime is not a function {
lms-backend-dev  |   "service": "lms-backend",
lms-backend-dev  |   "stack": "TypeError: s.loginTime.getTime is not a function\n    at /app/src/services/global/session-management.service.ts:172:51\n    at Array.filter (<anonymous>)\n    at SessionManagementService.checkSuspiciousActivity (/app/src/services/global/session-management.service.ts:171:39)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at AuthModuleService.login (/app/src/modules/auth/auth.service.ts:116:34)\n    at AuthController.login (/app/src/modules/auth/auth.controller.ts:35:22)"
lms-backend-dev  |   "id": "00000000-0000-0000-0000-000000000003"
lms-backend-dev  | } traceId=00000000000000000000000000000000 spanId=0000000000000000 
lms-backend-dev  | 2025-11-10 15:04:07 [debug]: Last login updated {
lms-backend-dev  |   "service": "lms-backend",
lms-backend-dev  |   "userId": "00000000-0000-0000-0000-000000000003"
lms-backend-dev  | } traceId=00000000000000000000000000000000 spanId=0000000000000000 
lms-backend-dev  | 2025-11-10 15:04:07 [info]: Session zYt0Pn4UIZjixE2QQ0iNhwD5xayaUOJB created for user 00000000-0000-0000-0000-000000000003 {
lms-backend-dev  |   "service": "lms-backend"
lms-backend-dev  | } traceId=00000000000000000000000000000000 spanId=0000000000000000 
lms-backend-dev  | 2025-11-10 15:04:07 [info]: User logged in successfully {
lms-backend-dev  |   "service": "lms-backend",
lms-backend-dev  |   "email": "instructor1@example.com",
lms-backend-dev  |   "userId": "00000000-0000-0000-0000-000000000003"
lms-backend-dev  | } traceId=00000000000000000000000000000000 spanId=0000000000000000 
lms-backend-dev  | 2025-11-10 15:04:07 [info]: Request completed {
lms-backend-dev  |   "service": "lms-backend",
lms-backend-dev  |   "method": "POST",
lms-backend-dev  |   "url": "/api/v1.3.0/auth/login",
lms-backend-dev  |   "statusCode": 200,
lms-backend-dev  |   "duration": "315ms",
lms-backend-dev  |   "ip": "::ffff:172.21.0.1"
lms-backend-dev  | } traceId=00000000000000000000000000000000 spanId=0000000000000000 
lms-backend-dev  | 2025-11-10 15:04:07 [info]: Incoming request {
lms-backend-dev  |   "service": "lms-backend",
lms-backend-dev  |   "method": "OPTIONS",
lms-backend-dev  |   "url": "/api/v1.3.0/courses/instructor/my-courses",
lms-backend-dev  |   "ip": "::ffff:172.21.0.1",
lms-backend-dev  |   "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
lms-backend-dev  | }
lms-backend-dev  | 2025-11-10 15:04:07 [info]: Request completed {
lms-backend-dev  |   "service": "lms-backend",
lms-backend-dev  |   "method": "OPTIONS",
lms-backend-dev  |   "url": "/api/v1.3.0/courses/instructor/my-courses",
lms-backend-dev  |   "statusCode": 204,
lms-backend-dev  |   "duration": "2ms",
lms-backend-dev  |   "ip": "::ffff:172.21.0.1"
lms-backend-dev  | } traceId=00000000000000000000000000000000 spanId=0000000000000000 
lms-backend-dev  | 2025-11-10 15:04:07 [info]: Incoming request {
lms-backend-dev  |   "service": "lms-backend",
lms-backend-dev  |   "method": "GET",
lms-backend-dev  |   "url": "/api/v1.3.0/courses/instructor/my-courses",
lms-backend-dev  |   "ip": "::ffff:172.21.0.1",
lms-backend-dev  |   "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
lms-backend-dev  | }
lms-backend-dev  | 2025-11-10 15:04:07 [debug]: Cache miss {
lms-backend-dev  |   "service": "lms-backend",
lms-backend-dev  |   "key": "http:8a06ca17dea2a45a5db20e74b1bc3f647a4f3e2a8e3a06fd61d8b8017c4a4dd1"
lms-backend-dev  | } traceId=00000000000000000000000000000000 spanId=0000000000000000 
lms-backend-dev  | 2025-11-10 15:04:07 [debug]: Cache get {
lms-backend-dev  |   "service": "lms-backend",
lms-backend-dev  |   "key": "http:8a06ca17dea2a45a5db20e74b1bc3f647a4f3e2a8e3a06fd61d8b8017c4a4dd1",
lms-backend-dev  |   "strategy": "hybrid",
lms-backend-dev  |   "hit": false,
lms-backend-dev  |   "duration": 2
lms-backend-dev  | } traceId=00000000000000000000000000000000 spanId=0000000000000000 
lms-backend-dev  | 2025-11-10 15:04:07 [debug]: Cache miss {
lms-backend-dev  |   "service": "lms-backend",
lms-backend-dev  |   "key": "http:8a06ca17dea2a45a5db20e74b1bc3f647a4f3e2a8e3a06fd61d8b8017c4a4dd1",
lms-backend-dev  |   "url": "/api/v1.3.0/courses/instructor/my-courses"
lms-backend-dev  | } traceId=00000000000000000000000000000000 spanId=0000000000000000 
lms-backend-dev  | 2025-11-10 15:04:07 [info]: Request completed {
lms-backend-dev  |   "service": "lms-backend",
lms-backend-dev  |   "method": "GET",
lms-backend-dev  |   "url": "/api/v1.3.0/courses/instructor/my-courses",
lms-backend-dev  |   "statusCode": 401,
lms-backend-dev  |   "duration": "4ms",
lms-backend-dev  |   "ip": "::ffff:172.21.0.1"
lms-backend-dev  | } traceId=00000000000000000000000000000000 spanId=0000000000000000 
lms-backend-dev  | 2025-11-10 15:04:21 [info]: Incoming request {
lms-backend-dev  |   "service": "lms-backend",
lms-backend-dev  |   "method": "OPTIONS",
lms-backend-dev  |   "url": "/api/v1.3.0/courses/instructor/my-courses",
lms-backend-dev  |   "ip": "::ffff:172.21.0.1",
lms-backend-dev  |   "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
lms-backend-dev  | }
lms-backend-dev  | 2025-11-10 15:04:21 [info]: Request completed {
lms-backend-dev  |   "service": "lms-backend",
lms-backend-dev  |   "method": "OPTIONS",
lms-backend-dev  |   "url": "/api/v1.3.0/courses/instructor/my-courses",
lms-backend-dev  |   "statusCode": 204,
lms-backend-dev  |   "duration": "1ms",
lms-backend-dev  |   "ip": "::ffff:172.21.0.1"
lms-backend-dev  | } traceId=00000000000000000000000000000000 spanId=0000000000000000 
lms-backend-dev  | 2025-11-10 15:04:21 [info]: Incoming request {
lms-backend-dev  |   "service": "lms-backend",
lms-backend-dev  |   "method": "GET",
lms-backend-dev  |   "url": "/api/v1.3.0/courses/instructor/my-courses",
lms-backend-dev  |   "ip": "::ffff:172.21.0.1",
lms-backend-dev  |   "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
lms-backend-dev  | }
lms-backend-dev  | 2025-11-10 15:04:21 [debug]: Cache miss {
lms-backend-dev  |   "service": "lms-backend",
lms-backend-dev  |   "key": "http:8a06ca17dea2a45a5db20e74b1bc3f647a4f3e2a8e3a06fd61d8b8017c4a4dd1"
lms-backend-dev  | } traceId=00000000000000000000000000000000 spanId=0000000000000000 
