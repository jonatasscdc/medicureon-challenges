# Cryptocurrency Transaction Tracking API

A robust REST API for tracking Ethereum and ERC-20 token transactions. This service fetches, stores, and provides detailed transaction history with human-readable formats.

## Features

- 🔍 Fetch last 5 transactions for any Ethereum address
- 💱 Support for both ETH and ERC-20 token transfers
- 📊 Human-readable transaction amounts with proper formatting
- 🔄 Automatic token detection and symbol resolution
- 📅 Query transactions by date range
- 🏷️ Transaction categorization (Incoming/Outgoing)
- 💾 Persistent storage with MongoDB

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas connection)
- Etherscan API key
- Infura API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jonatasscdc/simple-cryptocurrency-transaction-tracking.git
cd simple-cryptocurrency-transaction-tracking
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
ETHERSCAN_API_KEY=your_etherscan_api_key
INFURA_API_KEY=your_infura_api_key
```

## Usage

1. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

2. The API will be available at `http://localhost:3000`

## API Endpoints

### Fetch Transactions

```http
POST /api/transactions/fetch
Content-Type: application/json

{
    "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
```

This endpoint fetches and stores the last 5 transactions for the specified Ethereum address.

### Query Transactions

```http
GET /api/transactions/query?address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e&startDate=2024-01-01&endDate=2024-03-01
```

Query parameters:
- `address` (required): Ethereum address
- `startDate` (optional): ISO 8601 date format
- `endDate` (optional): ISO 8601 date format

## Response Format

Both endpoints return transactions in the following format:

```json
{
    "message": "Transactions processed successfully",
    "transactions": [
        {
            "hash": "0x...",
            "from": "0x...",
            "to": "0x...",
            "value": "1.5 ETH",
            "timestamp": "2024-03-15T10:30:00Z",
            "transactionType": "ETH Transfer",
            "direction": "Incoming",
            "humanReadableAmount": "1.5 ETH"
        }
    ]
}
```

## Error Handling

The API returns appropriate HTTP status codes:
- `400`: Invalid input parameters
- `500`: Server error with detailed error message

## Dependencies

The project uses the following main dependencies:
- Express.js for the REST API
- Mongoose for MongoDB interactions
- Web3.js for Ethereum interactions
- Axios for HTTP requests
- Express Validator for input validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
