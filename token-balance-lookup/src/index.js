import 'dotenv/config';
import express from 'express';
import { Web3 } from 'web3';
import balanceRouter from './routes/balance.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const web3 = new Web3(process.env.WEB3_PROVIDER_URL);
    const blockNumber = await web3.eth.getBlockNumber();
    res.json({ 
      status: 'ok',
      blockNumber,
      provider: process.env.WEB3_PROVIDER_URL
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message
    });
  }
});

// Routes
app.use('/api/balance', balanceRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 