import 'dotenv-flow/config';
import { Sequelize } from 'sequelize';
import logger from '../utils/logger.util';
import { seedCategories } from '../seeders/001a-seed-categories';

async function main() {
  const sequelize = new Sequelize(
    process.env.DATABASE_URL || 'postgresql://lms_user:123456@localhost:5432/lms_db',
    {
      dialect: 'postgres',
      logging: false,
      define: { underscored: true, freezeTableName: true, timestamps: true },
      timezone: '+00:00'
    }
  );

  try {
    await sequelize.authenticate();
    logger.info('DB connected');
    await seedCategories(sequelize);
    logger.info('Seeded categories successfully');
  } catch (e) {
    logger.error('Seed categories failed', e);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main().catch((e) => {
  logger.error('Fatal', e);
  process.exit(1);
});


