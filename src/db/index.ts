import { Sequelize } from 'sequelize-typescript';
import { dbConfig } from './config';

import { Role } from '../models/Role';
import { User } from '../models/User';
import { Business } from '../models/Business';
import { Table } from '../models/Table';
import { Category } from '../models/Category';
import { MenuItem } from '../models/MenuItem';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { Payment } from '../models/Payment';
import { UserBusiness } from '../models/UserBusiness';
import { File } from '../models/File';
import { TableAssignment } from '../models/TableAssignment';
import { TableRating } from '../models/TableRating';
import { PaymentMethod } from '../models/PaymentMethod';

const modelList = [
  Role,
  User,
  Business,
  Table,
  Category,
  MenuItem,
  Order,
  OrderItem,
  Payment,
  UserBusiness,
  File,
  TableAssignment,
  TableRating,
  PaymentMethod,
];

export const sequelize = new Sequelize({
  dialect: dbConfig.dialect,
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  username: dbConfig.username,
  password: dbConfig.password,
  logging: false,
  models: modelList,
});

export const models = {
  Role,
  User,
  Business,
  Table,
  Category,
  MenuItem,
  Order,
  OrderItem,
  Payment,
  UserBusiness,
  File,
  TableAssignment,
  TableRating,
  PaymentMethod,
};

export const initializeDatabase = async (): Promise<void> => {
  await sequelize.authenticate();
};

export const syncDatabase = async (): Promise<void> => {
  await sequelize.sync({ force: false, alter: true });
};
