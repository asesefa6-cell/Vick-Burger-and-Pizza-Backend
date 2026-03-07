import dotenv from 'dotenv';
import { Dialect } from 'sequelize';

dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  dialect: Dialect;
}

export const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vekr_burger',
  dialect: (process.env.DB_DIALECT as Dialect) || 'postgres',
};
