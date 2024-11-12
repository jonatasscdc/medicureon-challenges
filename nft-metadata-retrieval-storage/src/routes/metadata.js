import express from 'express';
import fetch from 'node-fetch';
import { Web3 } from 'web3';
import Metadata from '../models/metadata.js';

const router = express.Router();
const web3 = new Web3(process.env.WEB3_PROVIDER_URL);

// NFT contract ABI - only what we need
const minABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const isValidAddress = (address) => web3.utils.isAddress(address);

// Process and normalize metadata
function processMetadata(metadata) {
  const processed = {
    name: metadata.name || '',
    description: metadata.description || '',
    attributes: metadata.attributes || [],
  };

  // Handle different image field formats
  if (metadata.image_data || metadata.image) {
    processed.image = metadata.image_data || metadata.image;
    
    if (processed.image?.startsWith('data:image/svg+xml;base64,')) {
      processed.imageType = 'svg+xml';
    } else if (processed.image?.startsWith('ipfs://')) {
      processed.image = `https://ipfs.io/ipfs/${processed.image.slice(7)}`;
      processed.imageType = 'ipfs';
    } else if (processed.image) {
      processed.imageType = 'url';
    }
  }

  // Add optional fields if they exist
  if (metadata.external_url) processed.external_url = metadata.external_url;
  if (metadata.background_color) processed.background_color = metadata.background_color;
  if (metadata.animation_url) processed.animation_url = metadata.animation_url;

  return processed;
}

// Fetch and process metadata from URI
async function fetchMetadata(uri) {
  if (uri.startsWith('ipfs://')) {
    uri = `https://ipfs.io/ipfs/${uri.slice(7)}`;
  }
  
  try {
    // Handle base64 encoded JSON metadata
    if (uri.startsWith('data:application/json;base64,')) {
      const base64Data = uri.split(',')[1];
      const jsonString = Buffer.from(base64Data, 'base64').toString();
      const metadata = JSON.parse(jsonString);
      return processMetadata(metadata);
    }
    
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const metadata = await response.json();
    return processMetadata(metadata);
  } catch (error) {
    throw new Error(`Failed to fetch metadata: ${error.message}`);
  }
}

router.post('/', async (req, res) => {
  const { contractAddress, tokenId } = req.body;

  if (!contractAddress || !tokenId) {
    return res.status(400).json({ 
      success: false,
      error: 'contractAddress and tokenId are required.' 
    });
  }

  if (!isValidAddress(contractAddress)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid contract address format.' 
    });
  }

  try {
    // Check cache first
    const cachedMetadata = await Metadata.findOne({ 
      contractAddress: contractAddress.toLowerCase(), 
      tokenId 
    });

    // Clean metadata before sending response
    const cleanMetadata = (metadata) => {
      if (!metadata) return metadata;
      
      const cleaned = { ...metadata };
      if (cleaned.attributes) {
        cleaned.attributes = cleaned.attributes.map(attr => ({
          trait_type: attr.trait_type,
          value: attr.value
        }));
      }
      return cleaned;
    };

    // If cache is less than 1 hour old, return it
    if (cachedMetadata && 
        (new Date() - cachedMetadata.lastUpdated) < 3600000) {
      return res.json({
        success: true,
        data: {
          ...cleanMetadata(cachedMetadata.metadata),
          cached: true
        }
      });
    }

    // Fetch from blockchain
    const contract = new web3.eth.Contract(minABI, contractAddress);
    const tokenURI = await contract.methods.tokenURI(tokenId).call();
    const metadata = await fetchMetadata(tokenURI);

    // Update or create cache
    await Metadata.findOneAndUpdate(
      { contractAddress: contractAddress.toLowerCase(), tokenId },
      { 
        metadata,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: {
        ...cleanMetadata(metadata),
        cached: false
      }
    });
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      data: error.data
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch NFT metadata.',
      details: error.message 
    });
  }
});

export default router; 