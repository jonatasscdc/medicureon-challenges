import express from 'express';
import { Web3 } from 'web3';

const router = express.Router();
const web3 = new Web3(process.env.WEB3_PROVIDER_URL);

// Extended ERC-20 Token ABI
const minABI = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  // decimals
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  // name
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  }
];

const isValidAddress = (address) => web3.utils.isAddress(address);

// Updated format balance function
const formatBalance = (balance, decimals) => {
  const divisor = BigInt(10 ** decimals);
  const beforeDecimal = balance / divisor;
  const afterDecimal = balance % divisor;
  const fullNumber = `${beforeDecimal}.${afterDecimal.toString().padStart(decimals, '0')}`;
  return Number(fullNumber).toFixed(2);
};

// Fetch token price in USD
async function getTokenPrice(tokenContract) {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${tokenContract}&vs_currencies=usd`);
    const data = await response.json();
    return data[tokenContract.toLowerCase()]?.usd || 0;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return 0;
  }
}

router.post('/', async (req, res) => {
  const { tokenContract, walletAddress } = req.body;

  if (!tokenContract || !walletAddress) {
    return res.status(400).json({ error: 'tokenContract and walletAddress are required.' });
  }

  if (!isValidAddress(tokenContract) || !isValidAddress(walletAddress)) {
    return res.status(400).json({ error: 'Invalid Ethereum address format.' });
  }

  try {
    const contract = new web3.eth.Contract(minABI, tokenContract);

    // Fetch all required data
    const [balance, decimals, name, tokenPrice] = await Promise.all([
      contract.methods.balanceOf(walletAddress).call(),
      contract.methods.decimals().call(),
      contract.methods.name().call(),
      getTokenPrice(tokenContract)
    ]);

    // Format balance
    const balanceBigInt = BigInt(balance);
    const formattedBalance = formatBalance(balanceBigInt, Number(decimals));
    
    // Calculate USD value
    const usdValue = (Number(formattedBalance) * tokenPrice).toFixed(2);

    res.json({
      tokenName: name,
      tokenBalance: formattedBalance,
      tokenBalanceUSD: `$${usdValue}`
    });
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      code: error.code,
      data: error.data
    });
    res.status(500).json({ 
      error: 'Failed to fetch token balance.',
      details: error.message 
    });
  }
});

export default router; 