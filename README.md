# Spin Stores - P2P Escrow Marketplace

A decentralized peer-to-peer marketplace with built-in escrow functionality, powered by blockchain technology and WalletConnect.

## Features

- 🔐 **Wallet-based Authentication** - Connect with any Web3 wallet via Reown AppKit
- 💰 **Smart Contract Escrow** - Secure P2P transactions with automated escrow
- 🛍️ **Product Marketplace** - List, browse, and purchase products
- 📦 **Order Tracking** - Real-time order status and tracking
- 💬 **Messaging System** - Direct communication between buyers and sellers
- 🔒 **Secure Payments** - Funds held in escrow until delivery confirmation

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Package Manager**: Bun
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Ethereum (Sepolia testnet)
- **Wallet Integration**: Reown AppKit + Wagmi
- **Smart Contracts**: Solidity + Hardhat
- **Real-time**: Pusher/Socket.io

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- PostgreSQL database
- Reown Project ID (get from [dashboard.reown.com](https://dashboard.reown.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/Jujujulex/spin-stores.git
cd spin-stores

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Set up database
bun prisma generate
bun prisma migrate dev

# Run development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
spin-stores/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── products/          # Product pages
│   ├── orders/            # Order pages
│   └── messages/          # Messaging pages
├── components/            # React components
│   ├── ui/               # UI components
│   ├── wallet/           # Wallet components
│   ├── products/         # Product components
│   └── orders/           # Order components
├── contracts/            # Smart contracts
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
└── prisma/              # Database schema
```

## Smart Contracts

Deploy the escrow contract:

```bash
# Compile contracts
bun hardhat compile

# Run tests
bun hardhat test

# Deploy to Sepolia
bun hardhat run scripts/deploy.ts --network sepolia
```

## Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL="postgresql://..."

# Reown/WalletConnect
NEXT_PUBLIC_PROJECT_ID="your_project_id"

# Blockchain
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS="0x..."

# File Upload (S3/Cloudinary)
NEXT_PUBLIC_UPLOAD_URL="..."
UPLOAD_SECRET="..."

# Messaging (Pusher/Socket.io)
NEXT_PUBLIC_PUSHER_KEY="..."
PUSHER_SECRET="..."
```

## Development

```bash
# Run development server
bun dev

# Run tests
bun test

# Build for production
bun run build

# Start production server
bun start
```

## Deployment

The application is designed to be deployed on:
- **Frontend**: Vercel
- **Database**: Railway/Render
- **Smart Contracts**: Ethereum mainnet

See [implementation_plan.md](./docs/implementation_plan.md) for detailed deployment steps.

## Contributing

This is a private project. For questions or issues, please contact the repository owner.

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue or contact the development team.
