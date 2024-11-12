const express = require('express');
const { body, query, validationResult } = require('express-validator');
const axios = require('axios');
const Transaction = require('../models/transaction');
const { Web3 } = require('web3');

const router = express.Router();
const web3 = new Web3();

// Helper function to format token amount
const formatTokenAmount = (amount, decimals = 18) => {
  try {
    if (!amount || amount === '0') return '0';
    
    const divisor = BigInt(10) ** BigInt(decimals);
    const bigIntAmount = BigInt(amount);
    const wholePart = (bigIntAmount / divisor).toString();
    const fractionalPart = (bigIntAmount % divisor).toString().padStart(decimals, '0');
    
    // Remove trailing zeros from fractional part
    const trimmedFractional = fractionalPart.replace(/0+$/, '');
    
    // Format with commas for better readability
    const formattedWholePart = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return trimmedFractional 
      ? `${formattedWholePart}.${trimmedFractional}`
      : formattedWholePart;
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return amount;
  }
};

// Fetch and store last 5 transactions for an address
router.post('/fetch',
  body('address').isString().isLength({ min: 42, max: 42 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { address } = req.body;
      console.log('Fetching transactions for address:', address);

      // Fetch transactions from Etherscan
      const etherscanUrl = 'https://api.etherscan.io/api';
      const params = {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 5,
        sort: 'desc',
        apikey: process.env.ETHERSCAN_API_KEY
      };

      const response = await axios.get(etherscanUrl, { params });

      if (response.data.message === 'NOTOK' || response.data.status === '0') {
        throw new Error(response.data.result || 'Failed to fetch transactions from Etherscan');
      }

      const transactions = await Promise.all(response.data.result.map(async tx => {
        const isTokenTransfer = tx.input.startsWith('0xa9059cbb');
        let tokenSymbol = '';
        let tokenDecimals = 18;
        let tokenAmount = '0';

        if (isTokenTransfer) {
          try {
            // Get token contract ABI first
            const abiResponse = await axios.get(etherscanUrl, {
              params: {
                module: 'contract',
                action: 'getabi',
                address: tx.to,
                apikey: process.env.ETHERSCAN_API_KEY
              }
            });

            if (abiResponse.data.status === '1') {
              const abi = JSON.parse(abiResponse.data.result);
              const contract = new web3.eth.Contract(abi, tx.to);
              
              // Get token details
              const [symbol, decimals] = await Promise.all([
                contract.methods.symbol().call(),
                contract.methods.decimals().call()
              ]);

              tokenSymbol = symbol;
              tokenDecimals = parseInt(decimals);
              
              // Decode transfer data
              const decodedData = web3.eth.abi.decodeParameters(
                ['address', 'uint256'],
                tx.input.slice(10)
              );
              tokenAmount = decodedData[1];
            }
          } catch (error) {
            console.error('Error fetching token details:', error);
          }
        }

        const txData = {
          address,
          hash: tx.hash,
          from: tx.from,
          to: tx.to || '0x0',
          value: tx.value,
          timestamp: new Date(parseInt(tx.timeStamp) * 1000),
          blockNumber: parseInt(tx.blockNumber),
          isTokenTransfer,
          tokenSymbol,
          tokenDecimals,
          tokenAmount,
          methodId: tx.methodId,
          functionName: tx.functionName
        };

        // Add formatted amount
        txData.formattedAmount = isTokenTransfer && tokenSymbol
          ? `${formatTokenAmount(tokenAmount, tokenDecimals)} ${tokenSymbol}`
          : `${formatTokenAmount(tx.value)} ETH`;

        return txData;
      }));

      // Store or update transactions in MongoDB
      if (transactions.length > 0) {
        const operations = transactions.map(tx => ({
          updateOne: {
            filter: { hash: tx.hash },
            update: { $set: tx },
            upsert: true
          }
        }));

        await Transaction.bulkWrite(operations);
        console.log(`Processed ${transactions.length} transactions`);
      }

      res.json({ 
        message: transactions.length > 0 
          ? 'Transactions processed successfully'
          : 'No transactions found for this address',
        transactions: transactions.map(tx => ({
          ...tx,
          value: tx.isTokenTransfer
            ? `${formatTokenAmount(tx.tokenAmount, tx.tokenDecimals)} ${tx.tokenSymbol}`
            : `${formatTokenAmount(tx.value)} ETH`,
          // Add human readable amounts
          humanReadableAmount: tx.isTokenTransfer
            ? `${formatTokenAmount(tx.tokenAmount, tx.tokenDecimals)} ${tx.tokenSymbol}`
            : `${formatTokenAmount(tx.value)} ETH`,
          transactionType: tx.isTokenTransfer ? 'Token Transfer' : 'ETH Transfer',
          direction: tx.from.toLowerCase() === address.toLowerCase() ? 'Outgoing' : 'Incoming'
        }))
      });
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      res.status(500).json({ 
        error: error.message,
        details: error.response?.data
      });
    }
  }
);

// Query transactions by address and date range
router.get('/query',
  query('address').isString().isLength({ min: 42, max: 42 }),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { address, startDate, endDate } = req.query;
      
      const query = { address };
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const transactions = await Transaction.find(query)
        .sort({ timestamp: -1 });

      // Format the response
      const formattedTransactions = transactions.map(tx => ({
        ...tx.toObject(),
        value: tx.isTokenTransfer
          ? `${formatTokenAmount(tx.tokenAmount, tx.tokenDecimals)} ${tx.tokenSymbol}`
          : `${formatTokenAmount(tx.value)} ETH`,
        humanReadableAmount: tx.isTokenTransfer
          ? `${formatTokenAmount(tx.tokenAmount, tx.tokenDecimals)} ${tx.tokenSymbol}`
          : `${formatTokenAmount(tx.value)} ETH`,
        transactionType: tx.isTokenTransfer ? 'Token Transfer' : 'ETH Transfer',
        direction: tx.from.toLowerCase() === address.toLowerCase() ? 'Outgoing' : 'Incoming'
      }));

      res.json({ transactions: formattedTransactions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router; 