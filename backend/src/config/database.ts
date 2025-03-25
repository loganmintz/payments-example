import { DataSource } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { GemBalance } from '../entities/gem-balance.entity';
import { ModifierBalance } from '../entities/modifier-balance.entity';

const DATABASE_URL = process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon's SSL connection
  },
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  entities: [Transaction, GemBalance, ModifierBalance],
  migrations: [],
  subscribers: [],
});

export const setupDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}; 