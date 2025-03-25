import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import axios from 'axios';
import {
  ConnectorError,
  ConnectorErrorType,
  requestRoninWalletConnector,
} from '@sky-mavis/tanto-connect';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Transaction {
  id: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  status: string;
  createdAt: string;
  description?: string;
}

interface ModifierTransaction {
  id: string;
  walletAddress: string;
  gemModifier: string;
  description: string;
  createdAt: string;
}

const Transactions: React.FC = () => {
  const [address, setAddress] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modifierTransactions, setModifierTransactions] = useState<ModifierTransaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<(Transaction | ModifierTransaction & { type: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connector, setConnector] = useState<any>(null);
  
  useEffect(() => {
    getRoninWalletConnector();
  }, []);
  
  useEffect(() => {
    if (address) {
      fetchAllTransactionData(address);
    }
  }, [address]);
  
  const getRoninWalletConnector = async () => {
    try {
      const roninConnector = await requestRoninWalletConnector();
      setConnector(roninConnector);
      
      // Check if already connected
      const accounts = await roninConnector.getAccounts();
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
      }
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
      }
    } catch (error) {
      setError('Failed to connect to Ronin Wallet');
      console.error(error);
    }
  };

  const fetchAllTransactionData = async (walletAddress: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch regular transactions
      const txResponse = await axios.get(`http://localhost:3001/api/transactions/${walletAddress}`);
      setTransactions(txResponse.data || []);
      
      // Fetch modifier transactions
      const modifierResponse = await axios.get(`http://localhost:3001/api/modifiers/${walletAddress}/history`);
      setModifierTransactions(modifierResponse.data || []);
      
      // Combine and sort all transactions
      const regularTxs = (txResponse.data || []).map((tx: Transaction) => ({
        ...tx,
        type: 'transfer'
      }));
      
      const modifierTxs = (modifierResponse.data || []).map((tx: ModifierTransaction) => ({
        ...tx,
        type: 'modifier'
      }));
      
      const combined = [...regularTxs, ...modifierTxs];
      
      // Sort by date, newest first
      const sorted = combined.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setAllTransactions(sorted);
    } catch (error) {
      console.error('Failed to fetch transaction data:', error);
      setError('Failed to fetch transaction history');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setLoading(true);
      await axios.post('http://localhost:3001/api/transactions', {
        fromAddress: address,
        toAddress: recipient,
        amount: amount,
      });
      setAmount('');
      setRecipient('');
      fetchAllTransactionData(address);
    } catch (error) {
      setError('Failed to create transaction');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return addr.substring(0, 6) + '...' + addr.substring(addr.length - 4);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        className="gradient-text"
        sx={{ 
          textAlign: 'center', 
          fontWeight: 700, 
          mb: 4,
          fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' }
        }}
      >
        TRANSACTION HISTORY
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {!address ? (
        <Card 
          sx={{ 
            mb: 4, 
            borderRadius: 4,
            boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Connect Your Wallet
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
              Please connect your Ronin wallet to view your transaction history
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AccountBalanceWalletIcon />}
              onClick={connectWallet}
              sx={{ 
                py: 1.5,
                px: 4,
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card 
            sx={{ 
              mb: 4, 
              borderRadius: 4,
              boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    mr: 2,
                    width: 42,
                    height: 42,
                  }}
                >
                  <AccountBalanceWalletIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Connected Wallet
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {address}
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  onClick={() => fetchAllTransactionData(address)}
                  sx={{ ml: 'auto' }}
                >
                  Refresh
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card 
            sx={{ 
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <HistoryIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Transaction History
                </Typography>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : allTransactions.length > 0 ? (
                <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Details</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allTransactions.map((tx: any) => (
                        <TableRow key={tx.id} hover>
                          <TableCell>
                            {tx.type === 'transfer' ? (
                              <Chip 
                                icon={<ReceiptLongIcon />} 
                                label="Transfer" 
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            ) : (
                              <Chip 
                                icon={<AccessTimeIcon />} 
                                label="Modifier" 
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(tx.createdAt).toLocaleDateString()} 
                            <Typography variant="caption" display="block" color="text.secondary">
                              {new Date(tx.createdAt).toLocaleTimeString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {tx.type === 'transfer' ? (
                              <>
                                <Typography variant="body2">
                                  From: {formatAddress(tx.fromAddress)}
                                </Typography>
                                <Typography variant="body2">
                                  To: {formatAddress(tx.toAddress)}
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="body2">
                                {tx.description || 'Gem balance modified'}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: tx.type === 'transfer' 
                                  ? 'secondary.main' 
                                  : Number(tx.gemModifier) > 0 
                                    ? 'success.main' 
                                    : 'error.main',
                                fontWeight: 600
                              }}
                            >
                              {tx.type === 'transfer' 
                                ? `${tx.amount} RON` 
                                : `${Number(tx.gemModifier) > 0 ? '+' : ''}${tx.gemModifier} Gems`}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No transactions found for this address
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default Transactions; 