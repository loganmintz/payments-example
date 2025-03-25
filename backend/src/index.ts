import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { setupDatabase } from './config/database';
import { setupWeb3 } from './config/web3';
import { balanceRoutes } from './routes/balance.routes';
import { transactionRoutes } from './routes/transaction.routes';
import { gemBalanceRoutes } from './routes/gem-balance.routes';
import modifierBalanceRoutes from './routes/modifier-balance.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/balance', balanceRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/gems', gemBalanceRoutes);
app.use('/api/modifiers', modifierBalanceRoutes);

// Error handling
app.use(errorHandler);

// Initialize database and Web3
const initializeApp = async () => {
  try {
    await setupDatabase();
    await setupWeb3();
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

initializeApp(); 