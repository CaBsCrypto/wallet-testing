# CryptoPet MVP

A Web3 Virtual Pet game on Stellar Soroban.

## Structure
- `apps/web`: Next.js Frontend
- `packages/contracts`: Soroban Smart Contracts

## Getting Started

### Prerequisites
- Node.js
- Rust & Cargo
- Soroban CLI

### Setup
1. Install dependencies:
   ```bash
   cd apps/web
   npm install
   ```

2. Build Contracts:
   ```bash
   cd packages/contracts
   # If you have lock issues: set CARGO_TARGET_DIR=target_tmp
   cargo build --release --target wasm32-unknown-unknown
   ```

3. Run Frontend:
   ```bash
   cd apps/web
   npm run dev
   ```

## Development Status
- [x] Initial Architecture
- [x] Frontend Shell (Next.js + Tailwind)
- [x] Contract Logic (PetRegistry)
- [x] Wallet Connection (Freighter)
- [ ] Contract Deployment (Testnet)
