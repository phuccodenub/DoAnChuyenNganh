import request from 'supertest';
import app from '../../app';

// Skip E2E when sqlite3 is not available and DB models may fail to initialize
const wantsSqlite = process.env.DB_DIALECT === 'sqlite' || process.env.SQLITE === 'true';
let sqliteAvailable = true;
if (wantsSqlite) {
  try { require('sqlite3'); } catch { sqliteAvailable = false; }
}
const maybeDescribe: jest.Describe = (wantsSqlite && !sqliteAvailable) ? (describe.skip as any) : (describe as any);

maybeDescribe('E2E: Health endpoints', () => {
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


