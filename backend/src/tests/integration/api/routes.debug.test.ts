import request from 'supertest';

const wantsSqlite = process.env.DB_DIALECT === 'sqlite' || process.env.SQLITE === 'true';
let sqliteAvailable = true;
if (wantsSqlite) {
  try { require('sqlite3'); } catch { sqliteAvailable = false; }
}
const maybeDescribe: jest.Describe = (wantsSqlite && !sqliteAvailable) ? (describe.skip as any) : (describe as any);

// Minimal debug test to list registered /api routes

maybeDescribe('API Routes Debug', () => {
  it('should list /api router registered routes', async () => {
    const { default: app } = await import('@/app');
    const res = await request(app).get('/api/__routes_debug').expect(200);
    // eslint-disable-next-line no-console
    console.log('ROUTES_DEBUG:', res.body);
  });
});
