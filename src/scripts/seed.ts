import 'reflect-metadata';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { initializeDatabase, syncDatabase, sequelize, models } from '../db';

dotenv.config();

const TEST_PASSWORD = 'password123';

const seed = async (): Promise<void> => {
  await initializeDatabase();
  await syncDatabase();

  const roleNames = ['Super Admin', 'Admin', 'Manager', 'Chef', 'Waiter', 'Customer'];
  const roleMap = new Map<string, string>();

  for (const roleName of roleNames) {
    const [role] = await models.Role.findOrCreate({
      where: { roleName },
      defaults: { roleName, description: `${roleName} test role` },
    });
    roleMap.set(roleName, role.id);
  }

  const [business] = await models.Business.findOrCreate({
    where: { businessName: 'Vick Test Kitchen' },
    defaults: {
      businessName: 'Vick Test Kitchen',
      address: 'Bole Road, Addis Ababa',
      phone: '+251900000000',
    },
  });

  const usersToSeed = [
    { name: 'Test Super Admin', email: 'superadmin@test.com', roleName: 'Super Admin' },
    { name: 'Test Admin', email: 'admin@test.com', roleName: 'Admin' },
    { name: 'Test Manager', email: 'manager@test.com', roleName: 'Manager' },
    { name: 'Test Chef', email: 'chef@test.com', roleName: 'Chef' },
    { name: 'Test Waiter', email: 'waiter@test.com', roleName: 'Waiter' },
    { name: 'Test Customer', email: 'customer@test.com', roleName: 'Customer' },
  ];

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);
  for (const user of usersToSeed) {
    const roleId = roleMap.get(user.roleName);
    if (!roleId) continue;

    await models.User.findOrCreate({
      where: { email: user.email },
      defaults: {
        name: user.name,
        email: user.email,
        passwordHash,
        roleId,
        businessId: business.id,
      },
    });
  }

  const [pizzaCategory] = await models.Category.findOrCreate({
    where: { categoryName: 'Pizza', businessId: business.id },
    defaults: {
      categoryName: 'Pizza',
      description: 'Test pizza category',
      businessId: business.id,
    },
  });

  const [burgerCategory] = await models.Category.findOrCreate({
    where: { categoryName: 'Burger', businessId: business.id },
    defaults: {
      categoryName: 'Burger',
      description: 'Test burger category',
      businessId: business.id,
    },
  });

  await models.MenuItem.findOrCreate({
    where: { itemName: 'Margherita Pizza', businessId: business.id },
    defaults: {
      itemName: 'Margherita Pizza',
      description: 'Classic pizza with tomato and cheese',
      price: '9.99',
      availabilityStatus: true,
      itemType: 'food',
      directToWaiter: false,
      categoryId: pizzaCategory.id,
      businessId: business.id,
    },
  });

  await models.MenuItem.findOrCreate({
    where: { itemName: 'Classic Beef Burger', businessId: business.id },
    defaults: {
      itemName: 'Classic Beef Burger',
      description: 'Beef burger with lettuce and tomato',
      price: '7.49',
      availabilityStatus: true,
      itemType: 'food',
      directToWaiter: false,
      categoryId: burgerCategory.id,
      businessId: business.id,
    },
  });

  const [table] = await models.Table.findOrCreate({
    where: { tableNumber: 'T1', businessId: business.id },
    defaults: {
      tableNumber: 'T1',
      qrCode: 'test-qr-t1',
      businessId: business.id,
      isActive: true,
      isAvailable: true,
      status: 'waiting',
    },
  });

  const [order] = await models.Order.findOrCreate({
    where: { tableId: table.id, status: 'pending' },
    defaults: {
      tableId: table.id,
      status: 'pending',
      totalAmount: '17.48',
      paymentMethod: 'cash',
      pendingAt: new Date(),
    },
  });

  const [pizzaItem] = await models.MenuItem.findOrCreate({
    where: { itemName: 'Pepperoni Pizza', businessId: business.id },
    defaults: {
      itemName: 'Pepperoni Pizza',
      description: 'Pepperoni and mozzarella',
      price: '10.99',
      availabilityStatus: true,
      itemType: 'food',
      directToWaiter: false,
      categoryId: pizzaCategory.id,
      businessId: business.id,
    },
  });

  await models.OrderItem.findOrCreate({
    where: { orderId: order.id, itemId: pizzaItem.id },
    defaults: {
      orderId: order.id,
      itemId: pizzaItem.id,
      quantity: 1,
    },
  });

  await models.PaymentMethod.findOrCreate({
    where: { businessId: business.id, name: 'Cash' },
    defaults: {
      businessId: business.id,
      name: 'Cash',
      type: 'manual',
      isActive: true,
    },
  });

  await models.PaymentMethod.findOrCreate({
    where: { businessId: business.id, name: 'Chapa' },
    defaults: {
      businessId: business.id,
      name: 'Chapa',
      type: 'chapa',
      isActive: true,
    },
  });

  console.log('Seed complete.');
  console.log('Test users created (if missing):');
  console.log('superadmin@test.com / password123');
  console.log('admin@test.com / password123');
  console.log('manager@test.com / password123');
  console.log('chef@test.com / password123');
  console.log('waiter@test.com / password123');
  console.log('customer@test.com / password123');
};

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
