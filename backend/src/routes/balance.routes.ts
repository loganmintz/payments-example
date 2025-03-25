import { Router, Request, Response } from 'express';
import { getContract, getWeb3 } from '../config/web3';
import Web3 from 'web3';
import { updateGemBalance } from '../services/gem-balance.service';

const router = Router();

// The specific product type and ID values
// Let's use simplified decimal values for testing
const PRODUCT_TYPE = '49142716512428989480544990891951778026923736340389104044832350309467730665601'; // Simplified
const PRODUCT_ID = '24933023185053730017657803593993390280866285546389344822111420249874978831297';   // Simplified 
// Get balance for an address
router.get('/:address', async (req: Request, res: Response) => {
  const { address } = req.params;
  console.log(`[${new Date().toISOString()}] Balance API called for address: ${address}`);
  
  try {
    const web3 = getWeb3();
    
    // Get native RON balance
    const nativeBalance = await web3.eth.getBalance(address);
    console.log(`Native balance for ${address}: ${nativeBalance.toString()}`);
    
    try {
      // Try to get the contract balance as well
      const contract = getContract();
      
      // Call the balances function
      const contractBalance = await contract.methods.balances(
        PRODUCT_TYPE,
        PRODUCT_ID,
        address
      ).call();
      
      console.log(`Contract balance for ${address}: ${contractBalance ? contractBalance.toString() : '0'}`);
      
      // Update gem balance in database
      const contractBalanceStr = contractBalance ? contractBalance.toString() : '0';
      await updateGemBalance(address, contractBalanceStr);
      console.log(`Updated gem balance for ${address} based on contract balance: ${contractBalanceStr}`);
      
      // Return both balances in a consistent format
      res.json({
        address,
        nativeBalance: nativeBalance.toString(),
        contractBalance: contractBalanceStr,
        balance: nativeBalance.toString(), // Include for backward compatibility
        source: 'both'
      });
      
    } catch (contractError) {
      // If contract call failed, just return the native balance
      console.error('Contract call error:', 
        contractError instanceof Error 
          ? contractError.message 
          : String(contractError)
      );
      
      // Update gem balance with 0 RON for the contract
      await updateGemBalance(address, '0');
      console.log(`Updated gem balance for ${address} with zero contract balance due to error`);
      
      // Return a consistent structure even when contract fails
      res.json({
        address,
        nativeBalance: nativeBalance.toString(),
        contractBalance: '0',
        balance: nativeBalance.toString(), // Include for backward compatibility
        source: 'native'
      });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching balance for ${address}:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch balance',
      nativeBalance: '0',
      contractBalance: '0',
      balance: '0'
    });
  }
});

export const balanceRoutes = router; 