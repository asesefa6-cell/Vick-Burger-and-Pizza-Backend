import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

import { Role } from './Role';
import { User } from './User';
import { Business } from './Business';
import { Table } from './Table';
import { Category } from './Category';
import { MenuItem } from './MenuItem';
import { Order } from './Order';
import { OrderItem } from './OrderItem';
import { Payment } from './Payment';
import { UserBusiness } from './UserBusiness';
import { TableAssignment } from './TableAssignment';
import { TableRating } from './TableRating';
import { PaymentMethod } from './PaymentMethod';

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT || 5432);
const dbName = process.env.DB_NAME || 'vekr_burger';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: dbHost,
  port: dbPort,
  database: dbName,
  username: dbUser,
  password: dbPassword,
  logging: false,
  models: [
    Role,
    User,
    Business,
    UserBusiness,
    Table,
    Category,
    MenuItem,
    Order,
    OrderItem,
    Payment,
    TableAssignment,
    TableRating,
    PaymentMethod,
  ],
});

export const models = {
  Role,
  User,
  Business,
  UserBusiness,
  Table,
  Category,
  MenuItem,
  Order,
  OrderItem,
  Payment,
  TableAssignment,
  TableRating,
  PaymentMethod,
};

export const initializeDatabase = async (): Promise<void> => {
  await sequelize.authenticate();
};
