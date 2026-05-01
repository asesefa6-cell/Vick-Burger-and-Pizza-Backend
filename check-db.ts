
import { sequelize, models } from './src/db';

async function check() {
  try {
    await sequelize.authenticate();
    const count = await models.UserBusiness.count();
    const all = await models.UserBusiness.findAll({ paranoid: false });
    console.log('Total UserBusiness count:', count);
    console.log('Total (including deleted) count:', all.length);
    if (all.length > 0) {
      console.log('Sample record:', JSON.stringify(all[0], null, 2));
    }

    const users = await models.User.findAll({ limit: 5 });
    console.log('Users count:', users.length);

    const businesses = await models.Business.findAll({ limit: 5 });
    console.log('Businesses count:', businesses.length);

  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
