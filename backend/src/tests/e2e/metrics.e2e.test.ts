import request from 'supertest';
import app from '../../app';

describe('E2E: Metrics endpoints', () => {
  it('GET /metrics/prometheus should return text/plain and include baseline metrics', async () => {
    const res = await request(app).get('/metrics/prometheus');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toMatch(/# TYPE/);
  });

  it('GET /metrics should return json with success', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });
});


