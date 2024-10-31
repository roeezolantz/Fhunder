# 🌩️ Fhunder - Decentralized Confidential Crowdfunding Platform

<h4 align="center">
  <a href="https://docs.fhenix.zone/docs/devdocs/intro">Fhenix Documentation</a>
</h4>

## Overview

Fhunder is a decentralized crowdfunding platform built on the Fhenix Network that ensures backer confidentiality through Fully Homomorphic Encryption (FHE). Users can anonymously contribute to campaigns and claim rewards without revealing their funding amounts, providing a privacy-focused crowdfunding experience.

## Key Features

- **Private Contributions**: Using FHE technology, contribution amounts remain confidential while still verifying funding goals
- **NFT Rewards**: Contributors receive NFTs as proof of participation without exposing contribution amounts
- **Campaign Management**: Create and manage crowdfunding campaigns with encrypted funding goals
- **MetaMask Integration**: Seamless wallet connection and transaction signing
- **Confidential Progress**: Campaign progress shown in buckets (1/3, 2/3, 3/3) to maintain privacy

## Technical Stack

- **Frontend**: Next.js, RainbowKit, Wagmi, Viem
- **Smart Contracts**: Solidity with Fhenix FHE extensions
- **Blockchain**: Fhenix Network (L2)
- **Development Tools**: Hardhat, TypeScript, fhenixjs

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/installation)
- [Git](https://git-scm.com/downloads)
- [Docker](https://docs.docker.com/engine/install/)

## Quick Start

1. Install dependencies:
```
pnpm install
cd packages/backend
pnpm install
cd ../frontend
pnpm install
```

2. Start local Fhenix node:
```
cd packages/backend
pnpm chain:start
```
3. Deploy contracts:
```
cd packages/backend
pnpm deploy:contracts
```
4. Start the frontend:
```
cd packages/frontend
pnpm start
```

Visit your app on: `http://localhost:3000`

## Development

- Smart contracts are located in `packages/backend/contracts/`
- Frontend components in `packages/frontend/components/`
- Contract deployment scripts in `packages/backend/deploy/`

## Documentation

- [Fhenix Documentation](https://docs.fhenix.zone/docs/devdocs/intro)
- [Project Architecture](./Fhunder%20Architecture.md)

## Security Considerations

- All contribution amounts are encrypted using FHE
- Campaign funds are locked in smart contracts until goals are met
- NFT rewards preserve contributor privacy
- Role-based access control for administrative functions

## License

MIT
