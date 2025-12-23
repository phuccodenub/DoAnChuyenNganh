# Blockchain Module - Quick Start

## 🚀 Setup Nhanh (5 phút)

### 1. Install Dependencies

```bash
cd backend
npm install ethers@^6.0.0
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### 2. Initialize Hardhat

```bash
npx hardhat init
# Chọn: Create a TypeScript project
```

### 3. Start Local Blockchain

```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy contract
npx hardhat run scripts/deploy.ts --network localhost
```

### 4. Add to .env

```bash
BLOCKCHAIN_NETWORK=hardhat
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80  # Hardhat default account #0
CERTIFICATE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3  # Address sau khi deploy
```

### 5. Test

```bash
npx hardhat test
```

---

## 📁 Cấu Trúc Thư Mục

```
backend/
├── contracts/          # Smart contracts (Solidity)
│   └── Certificate.sol
├── scripts/            # Deploy scripts
│   └── deploy.ts
├── test/              # Contract tests
│   └── Certificate.test.ts
├── src/
│   └── modules/
│       └── blockchain/
│           ├── blockchain.service.ts
│           ├── blockchain.controller.ts
│           └── blockchain.routes.ts
└── hardhat.config.ts
```

---

## 🔗 Testnet Options (Free)

### Sepolia (Recommended)
- Faucet: https://sepoliafaucet.com/
- RPC: Use Alchemy/Infura free tier

### Mumbai (Polygon)
- Faucet: https://faucet.polygon.technology/
- RPC: `https://rpc-mumbai.maticvigil.com`

---

## 📚 Next Steps

1. Xem `docs/BLOCKCHAIN_SETUP_GUIDE.md` để biết chi tiết
2. Tạo smart contract cho use case của bạn
3. Integrate với backend service
4. Test với MetaMask

