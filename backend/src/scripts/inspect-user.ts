import 'dotenv-flow/config';
import { getSequelize } from '../config/db';
import { hashUtils } from '../utils/hash.util';

async function main() {
  const sequelize = getSequelize();
  const email = process.argv[2] || 'admin@example.com';
  const plain = process.argv[3] || 'Admin123!';
  const [rows]: any = await sequelize.query(
    'SELECT id, email, role, status, password AS password_hash FROM users WHERE email = ? LIMIT 1',
    { replacements: [email] }
  );
  const user = rows?.[0];
  if (!user) {
    console.log('NOT_FOUND');
    process.exit(0);
  }
  const { id, role, status, password_hash } = user;
  const ok = await hashUtils.password.comparePassword(plain, password_hash);
  console.log(JSON.stringify({ id, email, role, status, hasHash: !!password_hash, hashPrefix: String(password_hash).slice(0,10), compareOK: ok }, null, 2));
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
