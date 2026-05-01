import dotenv from 'dotenv';
import { Dialect } from 'sequelize';

dotenv.config();

export interface DatabaseConfig {
  mode: 'local' | 'external';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  dialect: Dialect;
  url?: string;
  ssl: boolean;
  sslRejectUnauthorized: boolean;
}

export const dbConfig: DatabaseConfig = {
  mode: process.env.DB_MODE === 'external' ? 'external' : 'local',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vekr_burger',
  dialect: (process.env.DB_DIALECT as Dialect) || 'postgres',
  ssl: process.env.DB_SSL === 'true',
  sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
  ...(process.env.DATABASE_URL ? { url: process.env.DATABASE_URL } : {}),
};
