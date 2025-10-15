import request from 'supertest';
import app from '../../app';

describe('E2E: Health endpoints', () => {
  it('GET /ping should return 200 and plain text pong', async () => {
    const res = await request(app).get('/ping');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toBe('pong');
  });

  it('GET /health should return overall health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
  });

  it('GET /health/ready should return readiness', async () => {
    const res = await request(app).get('/health/ready');
    expect([200, 503]).toContain(res.status); // ready may depend on external services
  });

  it('GET /health/database should return db health payload', async () => {
    const res = await request(app).get('/health/database');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('success');
  });
});


