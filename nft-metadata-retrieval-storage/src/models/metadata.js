import mongoose from 'mongoose';

const attributeSchema = new mongoose.Schema({
  trait_type: String,
  value: String
}, { _id: false }); // This prevents MongoDB from adding _id to attributes

const metadataSchema = new mongoose.Schema({
  contractAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  tokenId: {
    type: String,
    required: true
  },
  metadata: {
    name: String,
    description: String,
    image: String,
    imageType: {
      type: String,
      enum: ['url', 'ipfs', 'svg+xml']
    },
    attributes: [attributeSchema],
    external_url: String,
    background_color: String,
    animation_url: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Compound index for faster queries
metadataSchema.index({ contractAddress: 1, tokenId: 1 }, { unique: true });

export default mongoose.model('Metadata', metadataSchema); 