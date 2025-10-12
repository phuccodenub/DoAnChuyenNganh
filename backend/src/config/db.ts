import { Sequelize } from 'sequelize';

let sequelize: Sequelize | null = null;

export function getSequelize(): Sequelize {
  if (!sequelize) {
    sequelize = new Sequelize(
      process.env.DATABASE_URL || 'postgresql://lms_user:lms_password@localhost:5432/lms_db',
      {
        dialect: 'postgres',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        define: {
          underscored: true,
          freezeTableName: true,
          timestamps: true,
          paranoid: false
        },
        timezone: '+00:00'
      }
    );
  }
  return sequelize;
}

export async function connectDatabase(): Promise<void> {
  try {
    const db = getSequelize();
    await db.authenticate();
    console.log('Database connection has been established successfully');
    
    // Sync database in development
    if (process.env.NODE_ENV !== 'production') {
      await db.sync({ force: false }); // Disable alter to avoid migration issues
      console.log('Database models synchronized');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}
