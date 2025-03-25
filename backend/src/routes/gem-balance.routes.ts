import { Router, Request, Response } from 'express';
import { getGemBalanceByAddress, getGemBalanceWithModifier } from '../services/gem-balance.service';

const router = Router();

// Get gem balance for an address
router.get('/:address', async (req: Request, res: Response) => {
  const { address } = req.params;
  console.log(`[${new Date().toISOString()}] Gem balance API called for address: ${address}`);
  
  try {
    // Get the gem balance with modifier applied
    const balanceWithModifier = await getGemBalanceWithModifier(address);
    
    console.log(`Gem balance for ${address}: ${balanceWithModifier.gemBalance} (base: ${balanceWithModifier.baseGemBalance}, modifier: ${balanceWithModifier.modifierAmount})`);
    
    res.json({
      address,
      gemBalance: balanceWithModifier.gemBalance,
      baseGemBalance: balanceWithModifier.baseGemBalance,
      modifierAmount: balanceWithModifier.modifierAmount,
      ronBalance: balanceWithModifier.ronBalance,
      conversionRate: 1000 // 1 RON = 1000 gems
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching gem balance for ${address}:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch gem balance',
      gemBalance: '0',
      baseGemBalance: '0',
      modifierAmount: '0',
      ronBalance: '0'
    });
  }
});

export const gemBalanceRoutes = router; 