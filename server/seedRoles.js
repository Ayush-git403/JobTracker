const { Role, sequelize } = require('./models');

const seedRoles = async () => {
  await sequelize.sync();
  await Role.bulkCreate([
    { role_name: 'admin' },
    { role_name: 'employer' },
    { role_name: 'applicant' }
  ], { ignoreDuplicates: true });
  console.log('Roles seeded successfully');
  process.exit();
};

seedRoles();