const request = require('supertest');
const app = require('./src/app').default;
const { jwtUtils } = require('./src/utils/jwt.util');

const studentToken = jwtUtils.generateAccessToken('student-test', 'student@test.com', 'student');

(async () => {
  console.log('\n=== Testing /api/v1/admin/users/stats with STUDENT token ===');
  const res = await request(app)
    .get('/api/v1/admin/users/stats')
    .set('Authorization', `Bearer ${studentToken}`);
  console.log('Status:', res.status);
  console.log('Body:', JSON.stringify(res.body, null, 2));
})();
