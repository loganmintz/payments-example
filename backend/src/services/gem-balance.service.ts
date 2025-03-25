import { AppDataSource } from '../config/database';
import { GemBalance } from '../entities/gem-balance.entity';
import { getModifierBalanceByAddress } from './modifier-balance.service';

const gemBalanceRepository = AppDataSource.getRepository(GemBalance);

export const getGemBalanceByAddress = async (walletAddress: string): Promise<GemBalance | null> => {
  return await gemBalanceRepository.findOne({ where: { walletAddress } });
};

export const getGemBalanceWithModifier = async (walletAddress: string): Promise<{
  gemBalance: string;
  baseGemBalance: string;
  modifierAmount: string;
  ronBalance: string;
}> => {
  // Get the base gem balance
  const gemBalance = await getGemBalanceByAddress(walletAddress);
  const baseGemBalance = gemBalance ? gemBalance.gemBalance : '0';
  const ronBalance = gemBalance ? gemBalance.ronBalance : '0';
  
  // Get the modifier balance
  const modifierBalance = await getModifierBalanceByAddress(walletAddress);
  const modifierAmount = modifierBalance ? modifierBalance.gemModifier : '0';
  
  // Calculate the total gem balance (base + modifier)
  const totalGemBalance = (parseInt(baseGemBalance) + parseInt(modifierAmount)).toString();
  
  return {
    gemBalance: totalGemBalance,
    baseGemBalance,
    modifierAmount,
    ronBalance
  };
};

export const updateGemBalance = async (
  walletAddress: string, 
  ronBalance: string
): Promise<GemBalance> => {
  // Calculate gem balance as RON * 1000
  try {
    // Convert string to number, multiply by 1000
    const ronBalanceNumber = parseFloat(ronBalance);
    // Calculate gems (1000 gems per RON)
    const gemBalance = Math.floor(ronBalanceNumber).toString();
    
    // Check if a record already exists
    let gemBalanceRecord = await getGemBalanceByAddress(walletAddress);
    
    if (gemBalanceRecord) {
      // Update existing record
      gemBalanceRecord.ronBalance = ronBalance;
      gemBalanceRecord.gemBalance = gemBalance;
      return await gemBalanceRepository.save(gemBalanceRecord);
    } else {
      // Create new record
      const newGemBalance = new GemBalance();
      newGemBalance.walletAddress = walletAddress;
      newGemBalance.ronBalance = ronBalance;
      newGemBalance.gemBalance = gemBalance;
      return await gemBalanceRepository.save(newGemBalance);
    }
  } catch (error) {
    console.error('Error updating gem balance:', error);
    // If RON balance can't be parsed, set gems to 0
    const gemBalanceRecord = await getGemBalanceByAddress(walletAddress) || new GemBalance();
    gemBalanceRecord.walletAddress = walletAddress;
    gemBalanceRecord.ronBalance = ronBalance;
    gemBalanceRecord.gemBalance = '0';
    return await gemBalanceRepository.save(gemBalanceRecord);
  }
}; 