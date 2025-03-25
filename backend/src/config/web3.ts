import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';

// Ronin RPC endpoint
const RONIN_RPC_URL = process.env.REACT_APP_RONIN_RPC_URL || 'https://saigon-testnet.roninchain.com/rpc';

// Smart contract ABI for the balance payments contract
const CONTRACT_ABI: AbiItem[] = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"inputs":[],"name":"ArrayLengthMismatch","type":"error"},
  {"inputs":[],"name":"InvalidAmount","type":"error"},
  {"inputs":[],"name":"InvalidMsgValue","type":"error"},
  {"inputs":[],"name":"NotManager","type":"error"},
  {"inputs":[],"name":"NotWithdrawer","type":"error"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"productType","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"productId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"entityId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalBalance","type":"uint256"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"TopUp","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"productType","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"productId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"entityId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalBalance","type":"uint256"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"Withdraw","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"updatedCreditPrice","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"newTreasury","type":"address"}],"name":"updatedTreasury","type":"event"},
  {"inputs":[{"internalType":"uint256","name":"productType","type":"uint256"},{"internalType":"uint256","name":"productId","type":"uint256"},{"internalType":"uint256","name":"entityId","type":"uint256"}],"name":"balances","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256[]","name":"_amounts","type":"uint256[]"},{"internalType":"uint256[]","name":"_productTypes","type":"uint256[]"},{"internalType":"uint256[]","name":"_productIds","type":"uint256[]"},{"internalType":"uint256[]","name":"_entityIds","type":"uint256[]"},{"internalType":"bytes[]","name":"_data","type":"bytes[]"}],"name":"batchTopUpRON","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[],"name":"creditPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256[]","name":"_productTypes","type":"uint256[]"},{"internalType":"uint256[]","name":"_productIds","type":"uint256[]"},{"internalType":"uint256[]","name":"_entityIds","type":"uint256[]"}],"name":"getBatchBalance","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_treasury","type":"address"},{"internalType":"uint256","name":"_creditPrice","type":"uint256"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256[]","name":"_amounts","type":"uint256[]"},{"internalType":"uint256[]","name":"_productTypes","type":"uint256[]"},{"internalType":"uint256[]","name":"_productIds","type":"uint256[]"},{"internalType":"uint256[]","name":"_entityIds","type":"uint256[]"},{"internalType":"bytes[]","name":"_data","type":"bytes[]"}],"name":"managerBatchTopUp","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256[]","name":"_amounts","type":"uint256[]"},{"internalType":"uint256[]","name":"_productTypes","type":"uint256[]"},{"internalType":"uint256[]","name":"_productIds","type":"uint256[]"},{"internalType":"uint256[]","name":"_entityIds","type":"uint256[]"},{"internalType":"bytes[]","name":"_data","type":"bytes[]"}],"name":"managerBatchWithdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"managers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_creditPrice","type":"uint256"}],"name":"setCreditPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address[]","name":"_managers","type":"address[]"},{"internalType":"bool[]","name":"_statuses","type":"bool[]"}],"name":"setManagers","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_treasury","type":"address"}],"name":"setTreasury","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address[]","name":"_withdrawers","type":"address[]"},{"internalType":"bool[]","name":"_statuses","type":"bool[]"}],"name":"setWithdrawers","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint256","name":"_productType","type":"uint256"},{"internalType":"uint256","name":"_productId","type":"uint256"},{"internalType":"uint256","name":"_entityId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"topUpRON","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"treasury","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"withdrawers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}
];

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
console.log('Environment variables:', {
  CONTRACT_ADDRESS,
  RONIN_RPC_URL: process.env.REACT_APP_RONIN_RPC_URL
});

if (!CONTRACT_ADDRESS) {
  throw new Error('CONTRACT_ADDRESS environment variable is not set');
}

let web3: Web3;
let contract: Contract<typeof CONTRACT_ABI>;

export const setupWeb3 = async () => {
  try {
    web3 = new Web3(RONIN_RPC_URL);
    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    console.log('Web3 connection established');
  } catch (error) {
    console.error('Error connecting to Ronin blockchain:', error);
    throw error;
  }
};

export const getWeb3 = () => web3;
export const getContract = () => contract; 