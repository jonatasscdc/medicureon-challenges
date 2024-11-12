const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    index: true
  },
  hash: {
    type: String,
    required: true,
    unique: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  blockNumber: {
    type: Number,
    required: true
  },
  isTokenTransfer: {
    type: Boolean,
    default: false
  },
  tokenSymbol: String,
  tokenDecimals: Number,
  tokenAmount: String,
  methodId: String,
  functionName: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema); 