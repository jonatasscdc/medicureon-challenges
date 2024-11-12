# Token Balance Lookup API

A simple and efficient API endpoint that retrieves ERC-20 token balances for Ethereum addresses. The API provides token balances along with their USD value using real-time price data.

## Features

- Fetch ERC-20 token balances for any wallet address
- Get token name and formatted balance
- Real-time USD value conversion using CoinGecko API
- Input validation for Ethereum addresses
- Health check endpoint for monitoring
- Proper error handling

## Prerequisites

- Node.js (v16 or higher)
- npm (Node Package Manager)
- An Infura account and Project ID (or other Ethereum node provider)

## Installation

1. Clone the repository:
```
git clone https://github.com/jonatasscdc/token-balance-lookup.git
cd token-balance-lookup
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
WEB3_PROVIDER_URL=your_infura_or_node_provider_url
```

## Usage

1. Start the server:
```
npm start
```

For development with auto-reload:
```
npm run dev
```

## API Endpoints

### Token Balance
- **POST** `/api/balance`
- **Body**:
```json
{
  "tokenContract": "0x...",  // ERC-20 token contract address
  "walletAddress": "0x..."   // Wallet address to check balance
}
```
- **Response**:
```json
{
  "tokenName": "Token Name",
  "tokenBalance": "100.00",
  "tokenBalanceUSD": "150.00"
}
```

## Error Handling

The API includes proper error handling for:
- Invalid Ethereum addresses
- Missing required parameters
- Network connection issues
- Contract interaction failures

## Dependencies

The project uses the following main dependencies:
- Express.js for the API server
- Web3.js for Ethereum interaction
- dotenv for environment variable management

## Development

The codebase is structured as follows:
- `/src` - Main source code
  - `index.js` - Server setup and configuration
  - `/routes` - API route handlers
    - `balance.js` - Token balance lookup logic

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
