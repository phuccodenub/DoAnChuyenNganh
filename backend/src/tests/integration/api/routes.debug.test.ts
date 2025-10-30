import request from 'supertest';

// Minimal debug test to list registered /api routes

describe('API Routes Debug', () => {
  it('should list /api router registered routes', async () => {
    const { default: app } = await import('@/app');
    const res = await request(app).get('/api/__routes_debug').expect(200);
    // eslint-disable-next-line no-console
    console.log('ROUTES_DEBUG:', res.body);
  });
});
