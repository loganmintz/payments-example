import { AppDataSource } from '../config/database';
import { ModifierBalance } from '../entities/modifier-balance.entity';

const modifierBalanceRepository = AppDataSource.getRepository(ModifierBalance);

/**
 * Get modifier balance for an address
 */
export const getModifierBalanceByAddress = async (walletAddress: string): Promise<ModifierBalance | null> => {
  return await modifierBalanceRepository.findOne({ where: { walletAddress } });
};

/**
 * Initialize or get an existing modifier balance record
 */
export const getOrCreateModifierBalance = async (walletAddress: string): Promise<ModifierBalance> => {
  let modifierBalance = await getModifierBalanceByAddress(walletAddress);
  
  if (!modifierBalance) {
    modifierBalance = new ModifierBalance();
    modifierBalance.walletAddress = walletAddress;
    modifierBalance.gemModifier = '0';
    modifierBalance.description = 'Initial balance';
    await modifierBalanceRepository.save(modifierBalance);
  }
  
  return modifierBalance;
};

/**
 * Update the gem modifier balance for an address
 */
export const updateModifierBalance = async (
  walletAddress: string, 
  modifierAmount: string,
  description: string
): Promise<ModifierBalance> => {
  const modifierBalance = await getOrCreateModifierBalance(walletAddress);
  
  // Update the modifier balance
  modifierBalance.gemModifier = modifierAmount;
  modifierBalance.description = description;
  
  return await modifierBalanceRepository.save(modifierBalance);
};

/**
 * Add to the existing gem modifier balance for an address
 */
export const addToModifierBalance = async (
  walletAddress: string, 
  amountToAdd: string,
  description: string
): Promise<ModifierBalance> => {
  const modifierBalance = await getOrCreateModifierBalance(walletAddress);
  
  // Parse current and added values
  const currentModifier = parseInt(modifierBalance.gemModifier || '0');
  const addAmount = parseInt(amountToAdd);
  
  // Add the amount to the current modifier
  const newModifierAmount = (currentModifier + addAmount).toString();
  
  // Update the modifier balance
  modifierBalance.gemModifier = newModifierAmount;
  modifierBalance.description = description;
  
  return await modifierBalanceRepository.save(modifierBalance);
};

/**
 * Subtract from the existing gem modifier balance for an address
 */
export const subtractFromModifierBalance = async (
  walletAddress: string, 
  amountToSubtract: string,
  description: string
): Promise<ModifierBalance> => {
  const modifierBalance = await getOrCreateModifierBalance(walletAddress);
  
  // Parse current and subtracted values
  const currentModifier = parseInt(modifierBalance.gemModifier || '0');
  const subtractAmount = parseInt(amountToSubtract);
  
  // Subtract the amount from the current modifier
  const newModifierAmount = (currentModifier - subtractAmount).toString();
  
  // Update the modifier balance
  modifierBalance.gemModifier = newModifierAmount;
  modifierBalance.description = description;
  
  return await modifierBalanceRepository.save(modifierBalance);
}; 