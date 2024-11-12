# Medicureon Blockchain Challenges

This repository contains three independent blockchain-related API services, each focused on different aspects of Ethereum and NFT interaction.

## Projects Overview

### 1. Token Balance Lookup
A REST API service that retrieves ERC-20 token balances for Ethereum addresses with real-time USD value conversion.

**Key Features:**
- Fetch ERC-20 token balances for any wallet address
- Real-time USD value conversion using CoinGecko API
- Token name and formatted balance retrieval
- Input validation and health check endpoint

### 2. Simple Cryptocurrency Transaction Tracking
A robust transaction tracking API that fetches, stores, and provides detailed Ethereum and ERC-20 token transaction history.

**Key Features:**
- Fetch last 5 transactions for any Ethereum address
- Support for both ETH and ERC-20 token transfers
- Transaction categorization (Incoming/Outgoing)
- Query transactions by date range
- MongoDB persistence

### 3. NFT Metadata Retrieval & Storage
An API service that fetches and caches NFT metadata from the blockchain using MongoDB.

**Key Features:**
- Fetch NFT metadata using contract address and token ID
- Metadata caching in MongoDB
- Support for various image formats (URL, IPFS, SVG)
- Automatic metadata normalization

## Technical Stack

All projects share a similar modern JavaScript stack:

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Blockchain Interaction**: Web3.js
- **Database**: MongoDB (for projects 2 & 3)
- **Package Management**: npm
- **Environment**: dotenv for configuration

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/medicureon-challenges.git
cd medicureon-challenges
```

2. Install dependencies for each project:
```bash
cd token-balance-lookup && npm install
cd ../simple-cryptocurrency-transaction-tracking && npm install
cd ../nft-metadata-retrieval-storage && npm install
```

3. Configure environment variables:

Each project requires its own `.env` file. Here's what you need for each:

**Token Balance Lookup (.env)**:
```
PORT=3000
WEB3_PROVIDER_URL=your_infura_or_node_provider_url
```

**Transaction Tracking (.env)**:
```
PORT=3001
MONGODB_URI=your_mongodb_connection_string
ETHERSCAN_API_KEY=your_etherscan_api_key
INFURA_API_KEY=your_infura_api_key
```

**NFT Metadata (.env)**:
```
PORT=3002
WEB3_PROVIDER_URL=your_infura_url
MONGODB_URI=your_mongodb_connection_string
```

## Running the Projects

Each project can be run independently using:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Documentation

### Token Balance Lookup
- **POST** `/api/balance`
  - Retrieves token balance and USD value for a given address

### Transaction Tracking
- **POST** `/api/transactions/fetch`
  - Fetches last 5 transactions for an address
- **GET** `/api/transactions/query`
  - Queries transactions by date range

### NFT Metadata
- **POST** `/api/metadata`
  - Fetches and caches NFT metadata

For detailed API documentation, refer to each project's individual README.md file.

## Project Structure

```
medicureon-challenges/
├── token-balance-lookup/
├── simple-cryptocurrency-transaction-tracking/
└── nft-metadata-retrieval-storage/
```

Each project follows a similar structure:
```
project/
├── src/
│   ├── index.js
│   ├── routes/
│   ├── models/ (if applicable)
│   └── config/
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

All projects are licensed under the MIT License. 