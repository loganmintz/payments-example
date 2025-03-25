import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  Stack,
  Divider,
  Paper,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import { ethers } from 'ethers';
import axios from 'axios';
import {
  ConnectorError,
  ConnectorErrorType,
  requestRoninWalletConnector,
} from '@sky-mavis/tanto-connect';
import DiamondIcon from '@mui/icons-material/Diamond';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Smart contract ABI for the topUpRON function
const CONTRACT_ABI = [
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint256","name":"_productType","type":"uint256"},{"internalType":"uint256","name":"_productId","type":"uint256"},{"internalType":"uint256","name":"_entityId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"topUpRON","outputs":[],"stateMutability":"payable","type":"function"}
];

// The specific product type and ID values (matching backend)
const PRODUCT_TYPE = '49142716512428989480544990891951778026923736340389104044832350309467730665601';
const PRODUCT_ID = '24933023185053730017657803593993390280866285546389344822111420249874978831297';

// Contract address
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '0x2fee44f36baa6382d18c020005b341c01ffcfca5';

const Dashboard: React.FC = () => {
  const [address, setAddress] = useState('');
  const [nativeBalance, setNativeBalance] = useState<string | null>(null);
  const [contractBalance, setContractBalance] = useState<string | null>(null);
  const [gemBalance, setGemBalance] = useState<string | null>(null);
  const [baseGemBalance, setBaseGemBalance] = useState<string | null>(null);
  const [modifierAmount, setModifierAmount] = useState<string | null>(null);
  const [modifierDescription, setModifierDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [gemLoading, setGemLoading] = useState(false);
  const [modifierLoading, setModifierLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connector, setConnector] = useState<any>(null);
  
  // State for modifier form
  const [newModifierAmount, setNewModifierAmount] = useState('');
  const [newModifierDescription, setNewModifierDescription] = useState('');
  
  // State for Buy Gems dialog
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [buyAmount, setBuyAmount] = useState('1');
  const [buyLoading, setBuyLoading] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  useEffect(() => {
    getRoninWalletConnector();
  }, []);

  const getRoninWalletConnector = async () => {
    try {
      const roninConnector = await requestRoninWalletConnector();
      setConnector(roninConnector);
    } catch (error) {
      if (error instanceof ConnectorError) {
        setError(error.name);
      }
    }
  };

  const connectWallet = async () => {
    try {
      if (!connector && error === ConnectorErrorType.PROVIDER_NOT_FOUND) {
        window.open('https://wallet.roninchain.com', '_blank');
        return;
      }

      const connectResult = await connector?.connect();
      if (connectResult) {
        setAddress(connectResult.account);
        fetchBalance(connectResult.account);
        fetchGemBalance(connectResult.account);
      }
    } catch (error) {
      setError('Failed to connect to Ronin Wallet');
      console.error(error);
    }
  };

  const fetchBalance = async (walletAddress: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/api/balance/${walletAddress}`);
      
      // Handle the response formats from the backend
      if (response.data) {
        // Set native balance
        if (response.data.nativeBalance) {
          setNativeBalance(ethers.formatEther(response.data.nativeBalance));
        } else if (response.data.balance) {
          setNativeBalance(ethers.formatEther(response.data.balance));
        } else {
          setNativeBalance('0');
        }
        
        // Set contract balance (Super Battle Moki)
        if (response.data.contractBalance) {
          // For contract balance, don't use ethers.formatEther if the value is small
          // Instead, use the raw value directly if it's a small integer
          const contractBalanceValue = response.data.contractBalance;
          if (contractBalanceValue === '1' || contractBalanceValue === '0') {
            setContractBalance(contractBalanceValue);
          } else {
            setContractBalance(ethers.formatEther(contractBalanceValue));
          }
        } else {
          setContractBalance('0');
        }
      } else {
        // Fallback to zero if no data is returned
        setNativeBalance('0');
        setContractBalance('0');
      }
    } catch (error) {
      setError('Failed to fetch balance');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGemBalance = async (walletAddress: string) => {
    try {
      setGemLoading(true);
      const response = await axios.get(`http://localhost:3001/api/gems/${walletAddress}`);
      
      if (response.data) {
        // Set the total gem balance
        setGemBalance(response.data.gemBalance);
        // Set the base gem balance (without modifier)
        setBaseGemBalance(response.data.baseGemBalance);
        // Set the modifier amount
        setModifierAmount(response.data.modifierAmount);
      } else {
        setGemBalance('0');
        setBaseGemBalance('0');
        setModifierAmount('0');
      }
    } catch (error) {
      console.error('Failed to fetch gem balance:', error);
      // Don't set global error for gem balance to avoid disrupting the UI
      setGemBalance('0');
      setBaseGemBalance('0');
      setModifierAmount('0');
    } finally {
      setGemLoading(false);
    }
  };
  
  const addModifierGems = async (amount: string) => {
    if (!address || !amount || isNaN(parseInt(amount))) {
      return;
    }
    
    try {
      setModifierLoading(true);
      const response = await axios.post(`http://localhost:3001/api/modifiers/${address}/add`, {
        amount,
        description: newModifierDescription || `Added ${amount} gems`
      });
      
      if (response.data) {
        setModifierAmount(response.data.modifierAmount);
        setModifierDescription(response.data.description);
        
        // Re-fetch the gem balance to update the total
        await fetchGemBalance(address);
      }
    } catch (error) {
      console.error('Failed to add gems:', error);
      setError('Failed to add gems');
    } finally {
      setModifierLoading(false);
      setNewModifierAmount('');
      setNewModifierDescription('');
    }
  };
  
  const subtractModifierGems = async (amount: string) => {
    if (!address || !amount || isNaN(parseInt(amount))) {
      return;
    }
    
    try {
      setModifierLoading(true);
      const response = await axios.post(`http://localhost:3001/api/modifiers/${address}/subtract`, {
        amount,
        description: newModifierDescription || `Subtracted ${amount} gems`
      });
      
      if (response.data) {
        setModifierAmount(response.data.modifierAmount);
        setModifierDescription(response.data.description);
        
        // Re-fetch the gem balance to update the total
        await fetchGemBalance(address);
      }
    } catch (error) {
      console.error('Failed to subtract gems:', error);
      setError('Failed to subtract gems');
    } finally {
      setModifierLoading(false);
      setNewModifierAmount('');
      setNewModifierDescription('');
    }
  };

  const buyGems = async () => {
    if (!address || !buyAmount || isNaN(parseFloat(buyAmount)) || parseFloat(buyAmount) <= 0) {
      setBuyError('Please enter a valid amount');
      return;
    }
    
    try {
      setBuyLoading(true);
      setBuyError(null);
      setBuySuccess(false);
      
      // Calculate amount based on RON (10 amount units per 1 RON)
      // For example, if user enters 1 RON, we should send amount = 10
      const amountToSend = Math.floor(parseFloat(buyAmount) * 10);
      
      // Convert RON amount to wei for the value parameter
      const valueToSend = ethers.parseEther(buyAmount);
      
      // Setup ethers provider and signer
      if (!connector) {
        throw new Error('Wallet not connected');
      }
      
      // Get the provider and signer - Ronin Wallet uses a different approach
      const provider = new ethers.BrowserProvider(connector.provider);
      const signer = await provider.getSigner();
      
      // Create contract instance
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      console.log('Sending transaction - Amount:', amountToSend, 'Value:', valueToSend.toString());
      
      // Call topUpRON function with proper parameters
      const tx = await contract.topUpRON(
        amountToSend, // Amount parameter based on 0.1 RON ratio
        PRODUCT_TYPE, 
        PRODUCT_ID,
        address, // Use wallet address as entityId
        '0x', // Empty data
        { 
          value: valueToSend, // Value in wei
          gasLimit: 300000 // Higher gas limit to ensure transaction goes through
        }
      );
      
      console.log('Transaction sent:', tx.hash);
      
      // Wait for transaction to be confirmed
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      
      if (receipt && receipt.status === 1) {
        console.log('Transaction confirmed successfully');
        // Success
        setBuySuccess(true);
        
        // Refresh balances
        await fetchBalance(address);
        await fetchGemBalance(address);
        
        // Close dialog after a short delay
        setTimeout(() => {
          setBuyDialogOpen(false);
          setBuyAmount('1');
        }, 2000);
      } else {
        throw new Error('Transaction failed on the blockchain');
      }
    } catch (error) {
      console.error('Buy gems error:', error);
      
      // Extract the most useful error message
      let errorMessage = 'Transaction failed';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for common errors
        if (errorMessage.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user';
        } else if (errorMessage.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction';
        } else if (errorMessage.includes('reverted')) {
          errorMessage = 'Transaction reverted by the contract. You may not have enough RON or the contract rejected the transaction.';
        }
      }
      
      setBuyError(errorMessage);
    } finally {
      setBuyLoading(false);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        className="gradient-text"
        sx={{ 
          textAlign: 'center', 
          fontWeight: 700, 
          mb: 4,
          fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' }
        }}
      >
        GEM BALANCE DASHBOARD
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper 
        elevation={0}
        sx={{ 
          p: 0,
          mb: 4,
          background: 'transparent',
        }}
      >
        <Card 
          sx={{ 
            borderRadius: 4,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      bgcolor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(255, 166, 61, 0.4)'
                    }}
                  >
                    <AccountBalanceWalletIcon sx={{ fontSize: 36 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, textAlign: { xs: 'center', sm: 'left' } }}>
                      Ronin Wallet Connection
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        mt: 0.5,
                        textAlign: { xs: 'center', sm: 'left' }
                      }}
                    >
                      Connect your wallet to manage gems
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  {!address ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={connectWallet}
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: '1rem'
                      }}
                    >
                      Connect Ronin Wallet
                    </Button>
                  ) : (
                    <Box 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: 'rgba(78, 71, 220, 0.1)',
                        border: '1px solid rgba(78, 71, 220, 0.2)',
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 600,
                          color: 'secondary.main'
                        }}
                      >
                        Connected Address:
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {address}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box 
                  className="gem-balance float-animation"
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    p: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DiamondIcon 
                      sx={{ 
                        color: 'primary.main', 
                        mr: 1,
                        fontSize: '2rem'
                      }} 
                    />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Gem Balance
                    </Typography>
                  </Box>
                  
                  {gemLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                      <CircularProgress size={48} />
                    </Box>
                  ) : (
                    <>
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 700,
                          my: 2,
                          textAlign: 'center',
                          background: 'linear-gradient(90deg, #3DDC84 0%, #30BA6E 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          textFillColor: 'transparent',
                        }}
                      >
                        {gemBalance || '0'} GEMS
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Chip 
                          label={`Base: ${baseGemBalance || '0'}`} 
                          color="primary" 
                          sx={{ fontWeight: 600 }}
                        />
                        <Chip 
                          label={`Modifier: ${modifierAmount || '0'}`} 
                          color="secondary" 
                          sx={{ fontWeight: 600 }}
                        />
                      </Stack>
                      
                      {address && (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<ShoppingCartIcon />}
                          sx={{ mt: 3 }}
                          onClick={() => setBuyDialogOpen(true)}
                        >
                          Buy Gems
                        </Button>
                      )}
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Paper>

      {/* Details Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                RON Balance
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : (
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700,
                    color: 'primary.dark'
                  }}
                >
                  {nativeBalance || '0'} RON
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Super Battle Moki 
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : (
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700,
                    color: 'primary.dark'
                  }}
                >
                  {contractBalance || '0'} SBM
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, #4E47DC 0%, #3F3AB5 100%)',
              color: 'white',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 40px rgba(78, 71, 220, 0.4)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Last Updated
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                }}
              >
                {loading || gemLoading ? 
                  <CircularProgress size={24} color="inherit" /> : 
                  new Date().toLocaleTimeString()
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gem Modifier Section */}
      {address && (
        <Card 
          sx={{ 
            borderRadius: 4,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            mb: 4
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                mb: 3,
                textAlign: 'center',
                background: 'linear-gradient(90deg, #3DDC84 0%, #30BA6E 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textFillColor: 'transparent',
              }}
            >
              MODIFY GEM BALANCE
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount"
                  variant="outlined"
                  type="number"
                  value={newModifierAmount}
                  onChange={(e) => setNewModifierAmount(e.target.value)}
                  placeholder="Enter gem amount"
                  InputProps={{
                    sx: { 
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.8)',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  variant="outlined"
                  value={newModifierDescription}
                  onChange={(e) => setNewModifierDescription(e.target.value)}
                  placeholder="Reason for modification"
                  InputProps={{
                    sx: { 
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.8)',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={modifierLoading || !newModifierAmount}
                  onClick={() => addModifierGems(newModifierAmount)}
                  startIcon={<AddCircleOutlineIcon />}
                  sx={{ 
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}
                >
                  {modifierLoading ? <CircularProgress size={24} color="inherit" /> : 'Add Gems'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  disabled={modifierLoading || !newModifierAmount}
                  onClick={() => subtractModifierGems(newModifierAmount)}
                  startIcon={<RemoveCircleOutlineIcon />}
                  sx={{ 
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}
                >
                  {modifierLoading ? <CircularProgress size={24} color="inherit" /> : 'Subtract Gems'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Buy Gems Dialog */}
      <Dialog open={buyDialogOpen} onClose={() => !buyLoading && setBuyDialogOpen(false)}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700 }}>Buy Gems</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: { xs: '280px', sm: '350px' }, pt: 1 }}>
            {buySuccess ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                Successfully purchased gems!
              </Alert>
            ) : buyError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {buyError}
              </Alert>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Purchase gems using RON. 1 RON = 1000 gems (0.1 RON = 100 gems).
              </Typography>
            )}
            
            <TextField
              fullWidth
              label="Amount in RON"
              type="number"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              disabled={buyLoading || buySuccess}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">RON</InputAdornment>,
              }}
            />
            
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 2 }}>
              You will receive: {buyAmount && !isNaN(parseFloat(buyAmount)) 
                ? (parseFloat(buyAmount) * 1000).toFixed(0) 
                : '0'} gems
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setBuyDialogOpen(false)} 
            disabled={buyLoading}
            color="inherit"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={buyGems} 
            disabled={buyLoading || buySuccess || !buyAmount || parseFloat(buyAmount) <= 0}
            variant="contained"
            color="primary"
            startIcon={buyLoading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
          >
            {buyLoading ? 'Processing...' : 'Buy Gems'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 