import express from 'express';
import { getModifierBalanceByAddress } from '../services/modifier-balance.service';
import { updateModifierBalance, addToModifierBalance, subtractFromModifierBalance } from '../services/modifier-balance.service';
import { AppDataSource } from '../config/database';
import { ModifierBalance } from '../entities/modifier-balance.entity';

const router = express.Router();

// Get modifier balance for an address
router.get('/:address', async (req, res) => {
  try {
    console.log(`GET modifier balance for address: ${req.params.address}`);
    const walletAddress = req.params.address;
    
    const modifierBalance = await getModifierBalanceByAddress(walletAddress);
    console.log(`Modifier balance found: ${modifierBalance ? modifierBalance.gemModifier : 0}`);
    
    res.json(modifierBalance || { walletAddress, gemModifier: "0" });
  } catch (error) {
    console.error('Error getting modifier balance:', error);
    res.status(500).json({ error: 'Failed to get modifier balance' });
  }
});

// Get modifier balance history for an address
router.get('/:address/history', async (req, res) => {
  try {
    console.log(`GET modifier balance history for address: ${req.params.address}`);
    const walletAddress = req.params.address;
    
    // Get all modifier balance records for this address, ordered by creation date descending
    const modifierRepository = AppDataSource.getRepository(ModifierBalance);
    const history = await modifierRepository.find({
      where: { walletAddress },
      order: { createdAt: 'DESC' },
      take: 50 // Limit to 50 most recent records
    });
    
    console.log(`Found ${history.length} modifier history records for address: ${walletAddress}`);
    res.json(history);
  } catch (error) {
    console.error('Error getting modifier balance history:', error);
    res.status(500).json({ error: 'Failed to get modifier balance history' });
  }
});

// Set a modifier balance
router.post('/set/:address', async (req, res) => {
  try {
    const walletAddress = req.params.address;
    const amount = req.body.amount;
    const description = req.body.description || `Set modifier balance to ${amount}`;
    
    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    console.log(`Setting modifier balance for ${walletAddress} to ${amount}`);
    const modifierBalance = await updateModifierBalance(walletAddress, amount, description);
    
    res.json(modifierBalance);
  } catch (error) {
    console.error('Error setting modifier balance:', error);
    res.status(500).json({ error: 'Failed to set modifier balance' });
  }
});

// Add to a modifier balance
router.post('/:address/add', async (req, res) => {
  try {
    const walletAddress = req.params.address;
    const amount = req.body.amount;
    const description = req.body.description || `Added ${amount} to modifier balance`;
    
    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    console.log(`Adding ${amount} to modifier balance for ${walletAddress}`);
    const modifierBalance = await addToModifierBalance(walletAddress, amount, description);
    
    res.json(modifierBalance);
  } catch (error) {
    console.error('Error adding to modifier balance:', error);
    res.status(500).json({ error: 'Failed to add to modifier balance' });
  }
});

// Subtract from a modifier balance
router.post('/:address/subtract', async (req, res) => {
  try {
    const walletAddress = req.params.address;
    const amount = req.body.amount;
    const description = req.body.description || `Subtracted ${amount} from modifier balance`;
    
    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    console.log(`Subtracting ${amount} from modifier balance for ${walletAddress}`);
    const modifierBalance = await subtractFromModifierBalance(walletAddress, amount, description);
    
    res.json(modifierBalance);
  } catch (error) {
    console.error('Error subtracting from modifier balance:', error);
    res.status(500).json({ error: 'Failed to subtract from modifier balance' });
  }
});

export default router; 