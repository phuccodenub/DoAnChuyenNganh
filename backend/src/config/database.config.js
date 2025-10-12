require('dotenv-flow/config');

module.exports = {
  development: {
    url: process.env.DATABASE_URL || 'postgresql://lms_user:lms_password@localhost:5432/lms_db',
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    url: process.env.DATABASE_URL || 'postgresql://lms_user:lms_password@localhost:5432/lms_db_test',
    dialect: 'postgres',
    logging: false
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
