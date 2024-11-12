# NFT Metadata Retrieval & Storage API

An API service that fetches NFT metadata from the blockchain and stores it in MongoDB. The API retrieves the name, description, and image URL for any NFT given its contract address and token ID.

## Features

- Fetch NFT metadata from blockchain using contract address and token ID
- Store metadata in MongoDB for caching
- Return formatted metadata response
- Input validation for contract addresses and token IDs
- Health check endpoint
- Error handling

## Prerequisites

- Node.js (v16 or higher)
- npm (Node Package Manager)
- MongoDB instance
- Infura account and Project ID (or other Ethereum node provider)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nft-metadata-retrieval-storage.git
cd nft-metadata-retrieval-storage
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
PORT=3000
WEB3_PROVIDER_URL=your_infura_url
MONGODB_URI=your_mongodb_connection_string
```

## Usage

Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Fetch NFT Metadata
- **POST** `/api/metadata`
- **Body**:
```json
{
  "contractAddress": "0x...",  // NFT contract address
  "tokenId": "1234"           // Token ID to fetch
}
```
- **Response**:
```json
{
  "name": "NFT Name",
  "description": "NFT Description",
  "image": "https://...",
  "attributes": [],
  "cached": false            // Indicates if response was from cache
}
```

## Error Handling

The API includes proper error handling for:
- Invalid contract addresses
- Invalid token IDs
- Network connection issues
- Contract interaction failures
- Database connection issues

## License

MIT License 