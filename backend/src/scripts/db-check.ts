import 'dotenv-flow/config';
import { getSequelize } from '../config/db';
import logger from '../utils/logger.util';

async function main() {
  const sequelize = getSequelize();
  try {
    await sequelize.authenticate();
    logger.info('✅ Kết nối DB thành công');

    // Hiển thị user/database hiện tại
    const [infoRows]: any = await sequelize.query(
      `SELECT current_database() AS db, current_user AS usr;`
    );
    console.log('DB info:', infoRows[0]);

    // Đếm số user hiện có
    const [countRows]: any = await sequelize.query(
      `SELECT COUNT(*)::int AS cnt FROM users;`
    );
    console.log('Users count:', countRows[0].cnt);

    // Kiểm tra 3 tài khoản test (nếu đã seed)
    const [usersRows]: any = await sequelize.query(
      `SELECT email, role, status, LEFT(password, 4) AS pass_prefix
       FROM users
       WHERE email IN ('superadmin@example.com','admin@example.com','student11@example.com')
       ORDER BY email;`
    );
    console.table(usersRows);

    process.exit(0);
  } catch (e) {
    logger.error('❌ Lỗi kiểm tra DB:', e);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if ((require as any).main === module) {
  main();
}
