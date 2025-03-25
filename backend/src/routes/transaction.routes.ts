import { Router } from 'express';
import { getWeb3 } from '../config/web3';
import { AppDataSource } from '../config/database';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';

const router = Router();
const transactionRepository = AppDataSource.getRepository(Transaction);

// Create a new transaction
router.post('/', async (req, res) => {
  try {
    const { fromAddress, toAddress, amount } = req.body;
    const web3 = getWeb3();

    // Create transaction record
    const transaction = new Transaction();
    transaction.fromAddress = fromAddress;
    transaction.toAddress = toAddress;
    transaction.amount = amount;
    transaction.status = TransactionStatus.PENDING;

    // Save to database
    await transactionRepository.save(transaction);

    // Send native currency transaction instead of token transfer
    const tx = await web3.eth.sendTransaction({
      from: fromAddress,
      to: toAddress,
      value: web3.utils.toWei(amount.toString(), 'ether'),
      gas: 21000
    });

    // Update transaction record with hash
    transaction.txHash = typeof tx.transactionHash === 'string' 
      ? tx.transactionHash 
      : web3.utils.toHex(tx.transactionHash);
    transaction.status = TransactionStatus.COMPLETED;
    await transactionRepository.save(transaction);

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Failed to process transaction' });
  }
});

// Get transaction history for an address
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const transactions = await transactionRepository.find({
      where: [
        { fromAddress: address },
        { toAddress: address }
      ],
      order: { createdAt: 'DESC' }
    });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export const transactionRoutes = router; 