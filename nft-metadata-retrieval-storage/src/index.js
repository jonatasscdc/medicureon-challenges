import 'dotenv/config';
import express from 'express';
import { Web3 } from 'web3';
import { connectDB } from './config/database.js';
import metadataRouter from './routes/metadata.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const web3 = new Web3(process.env.WEB3_PROVIDER_URL);
    const blockNumber = await web3.eth.getBlockNumber();
    res.json({ 
      status: 'ok',
      blockNumber,
      provider: process.env.WEB3_PROVIDER_URL,
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message
    });
  }
});

// Routes
app.use('/api/metadata', metadataRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 