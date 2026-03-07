import 'reflect-metadata';
import dotenv from 'dotenv';
import http from 'http';
import bcrypt from 'bcrypt';
import app from './app';
import { initializeDatabase, syncDatabase } from './db';
import { initSocket } from './realtime/socket';
import { models } from './db';

dotenv.config();

const port = Number(process.env.PORT || 3000);

const seedSuperAdmin = async (): Promise<void> => {
  const email = 'superadmin@gmail.com';
  const name = 'superadmin';
  const password = 'password123';

  const existingUser = await models.User.findOne({ where: { email } });
  if (existingUser) return;

  let role = await models.Role.findOne({ where: { roleName: 'Super Admin' } });
  if (!role) {
    role = await models.Role.create({ roleName: 'Super Admin', description: 'System owner' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await models.User.create({
    name,
    email,
    passwordHash,
    roleId: role.id,
    businessId: null,
  });
};

const startServer = async (): Promise<void> => {
  try {
    await initializeDatabase();
    await syncDatabase();
    await seedSuperAdmin();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
