const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false });

async function main() {
  const [results] = await sequelize.query(`
    SELECT enumlabel FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_notifications_category')
  `);
  console.log('Categories:', results.map(r => r.enumlabel));
  
  const [types] = await sequelize.query(`
    SELECT enumlabel FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_notifications_notification_type')
  `);
  console.log('Types:', types.map(r => r.enumlabel));
  
  const [priorities] = await sequelize.query(`
    SELECT enumlabel FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_notifications_priority')
  `);
  console.log('Priorities:', priorities.map(r => r.enumlabel));
  
  process.exit(0);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
