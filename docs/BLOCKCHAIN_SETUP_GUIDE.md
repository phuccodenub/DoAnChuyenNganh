# 🚀 Hướng Dẫn Tích Hợp Blockchain - Miễn Phí Cho Dev/Test

## 📋 Tổng Quan

Tài liệu này hướng dẫn tích hợp blockchain vào LMS với các giải pháp **hoàn toàn miễn phí** cho môi trường development và testing.

> ⚠️ **Lưu ý:** 
> - Nếu bạn cần **search/verify được trên mọi nền tảng** (Etherscan, OpenSea, etc.), xem thêm **[BLOCKCHAIN_PUBLIC_SEARCHABLE.md](./BLOCKCHAIN_PUBLIC_SEARCHABLE.md)** - Hướng dẫn dùng Public Blockchains.
> - Nếu bạn cần **miễn phí + search được công khai**, xem **[BLOCKCHAIN_FREE_PUBLIC_TESTNET.md](./BLOCKCHAIN_FREE_PUBLIC_TESTNET.md)** - Hướng dẫn dùng Public Testnets.

---

## 🎯 Use Cases Cho LMS

1. **Blockchain Certificates** - Chứng chỉ không thể giả mạo
2. **Achievement Badges (NFT)** - Huy hiệu thành tích
3. **Learning Records** - Ghi nhận quá trình học tập
4. **Smart Contract Enrollment** - Đăng ký khóa học tự động

---

## 🆓 Giải Pháp Miễn Phí (Recommended)

### ⚠️ **Lưu ý quan trọng về Search/Verify:**

Nếu bạn cần **search/verify được trên mọi nền tảng** (Etherscan, Polygonscan, OpenSea, etc.), bạn **PHẢI** dùng:
- ✅ **Public Testnets** (Sepolia, Mumbai) - Có thể verify trên blockchain explorers
- ✅ **Public Mainnets** (Ethereum, Polygon) - Có thể search công khai
- ❌ **Local Blockchain** - Chỉ dùng cho dev, không thể search công khai

**Recommendation cho Production:**
- **Polygon Mainnet** - Gas fees thấp nhất, có thể verify trên Polygonscan
- **Ethereum Mainnet** - Phổ biến nhất, có thể verify trên Etherscan
- **Base Mainnet** - Coinbase backed, có thể verify trên Basescan

---

### 1. **Local Blockchain (Hardhat/Ganache) - CHỈ CHO DEV** ⚠️

**Ưu điểm:**
- ✅ Hoàn toàn miễn phí
- ✅ Nhanh, không cần internet
- ✅ Full control, reset dễ dàng
- ✅ Perfect cho development

**Nhược điểm:**
- ❌ **KHÔNG thể search/verify công khai** - Chỉ local
- ❌ Không có blockchain explorer
- ❌ Không thể share với người khác

**Setup:**

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Hoặc Ganache (GUI friendly)
npm install -g ganache
```

**Cấu hình Hardhat:**

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
};
```

---

### 2. **Ethereum Testnets - HOÀN TOÀN MIỄN PHÍ + SEARCH ĐƯỢC CÔNG KHAI** ⭐⭐⭐

#### **Sepolia Testnet** (Recommended cho Dev/Test - CÓ THỂ SEARCH CÔNG KHAI)
- ✅ **Hoàn toàn miễn phí** - Không tốn bất kỳ chi phí nào
- ✅ **CÓ THỂ VERIFY trên Sepolia Etherscan**: https://sepolia.etherscan.io/
- ✅ **CÓ THỂ SEARCH công khai** - Mọi người có thể verify certificates
- ✅ **Có thể view trên OpenSea Testnet**: https://testnets.opensea.io/
- ✅ Stable, được maintain bởi Ethereum Foundation
- ✅ Free test ETH từ faucets
- ✅ RPC endpoints miễn phí (Alchemy, Infura free tier)

**Đây là giải pháp HOÀN HẢO cho dev/test:**
- Miễn phí 100%
- Có thể search/verify công khai trên testnet explorer
- Có thể view trên OpenSea testnet
- Giống hệt mainnet về functionality

**Faucets (Lấy test ETH miễn phí):**
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia
- https://www.alchemy.com/faucets/ethereum-sepolia

**RPC Endpoints (Free tier):**
- Alchemy: 300M requests/month free
- Infura: 100k requests/day free
- QuickNode: 10M requests/month free

#### **Goerli Testnet** (Deprecated - không recommend)

---

### 3. **Polygon Testnet - HOÀN TOÀN MIỄN PHÍ + SEARCH ĐƯỢC CÔNG KHAI** ⭐⭐⭐

#### **Mumbai Testnet** (Recommended cho Dev/Test - CÓ THỂ SEARCH CÔNG KHAI)
- ✅ **Hoàn toàn miễn phí** - Không tốn bất kỳ chi phí nào
- ✅ **CÓ THỂ VERIFY trên Mumbai Polygonscan**: https://mumbai.polygonscan.com/
- ✅ **CÓ THỂ SEARCH công khai** - Mọi người có thể verify certificates
- ✅ **Có thể view trên OpenSea Testnet**: https://testnets.opensea.io/
- ✅ Gas fees cực thấp (gần như 0)
- ✅ Tương thích với Ethereum
- ✅ Fast transactions

**Faucet:**
- https://faucet.polygon.technology/
- https://mumbaifaucet.com/

**RPC:**
- Public RPC: `https://rpc-mumbai.maticvigil.com`
- Alchemy: Free tier available

**Đây là giải pháp HOÀN HẢO cho dev/test:**
- Miễn phí 100%
- Có thể search/verify công khai trên testnet explorer
- Có thể view trên OpenSea testnet
- Giống hệt mainnet về functionality

---

### 4. **Base Testnet (Coinbase) - HOÀN TOÀN MIỄN PHÍ** ⭐

- ✅ Hoàn toàn miễn phí
- ✅ Backed by Coinbase
- ✅ Fast & cheap
- ✅ Good for production later

**Faucet:**
- https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

---

### 5. **Arbitrum Sepolia Testnet - HOÀN TOÀN MIỄN PHÍ**

- ✅ Hoàn toàn miễn phí
- ✅ Layer 2, fast & cheap
- ✅ Good scalability

**Faucet:**
- https://faucet.quicknode.com/arbitrum/sepolia

---

## 🛠️ Tech Stack Recommendation

### **Cho Development:**
```json
{
  "blockchain": "Hardhat (local) hoặc Sepolia Testnet",
  "smart-contracts": "Solidity 0.8.20+",
  "web3-library": "ethers.js v6",
  "wallet": "MetaMask",
  "ipfs": "Pinata (free tier) hoặc local IPFS",
  "testing": "Hardhat Test"
}
```

### **Cho Testing:**
```json
{
  "blockchain": "Sepolia hoặc Mumbai Testnet",
  "smart-contracts": "Solidity 0.8.20+",
  "web3-library": "ethers.js v6",
  "wallet": "MetaMask",
  "ipfs": "Pinata (free tier)",
  "monitoring": "Etherscan Testnet (free)"
}
```

---

## 📦 Installation & Setup

### **Step 1: Install Dependencies**

```bash
# Backend
cd backend
npm install ethers@^6.0.0
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Frontend
cd frontend
npm install ethers@^6.0.0
npm install @metamask/detect-provider
```

### **Step 2: Setup Hardhat (Local Blockchain)**

```bash
cd backend
npx hardhat init
```

**hardhat.config.ts:**
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};

export default config;
```

### **Step 3: Create Smart Contract**

**contracts/Certificate.sol:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Certificate {
    struct CertificateData {
        address recipient;
        string courseId;
        string certificateHash;
        uint256 issuedAt;
        bool revoked;
    }

    mapping(bytes32 => CertificateData) public certificates;
    address public owner;
    
    event CertificateIssued(
        bytes32 indexed certificateId,
        address indexed recipient,
        string courseId,
        string certificateHash
    );
    
    event CertificateRevoked(bytes32 indexed certificateId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function issueCertificate(
        address recipient,
        string memory courseId,
        string memory certificateHash
    ) public onlyOwner returns (bytes32) {
        bytes32 certificateId = keccak256(
            abi.encodePacked(recipient, courseId, block.timestamp)
        );
        
        certificates[certificateId] = CertificateData({
            recipient: recipient,
            courseId: courseId,
            certificateHash: certificateHash,
            issuedAt: block.timestamp,
            revoked: false
        });
        
        emit CertificateIssued(certificateId, recipient, courseId, certificateHash);
        return certificateId;
    }

    function verifyCertificate(bytes32 certificateId) 
        public 
        view 
        returns (bool, CertificateData memory) 
    {
        CertificateData memory cert = certificates[certificateId];
        bool isValid = cert.recipient != address(0) && !cert.revoked;
        return (isValid, cert);
    }

    function revokeCertificate(bytes32 certificateId) public onlyOwner {
        require(certificates[certificateId].recipient != address(0), "Certificate not found");
        certificates[certificateId].revoked = true;
        emit CertificateRevoked(certificateId);
    }
}
```

### **Step 4: Deploy Script**

**scripts/deploy.ts:**
```typescript
import { ethers } from "hardhat";

async function main() {
  const Certificate = await ethers.getContractFactory("Certificate");
  const certificate = await Certificate.deploy();
  
  await certificate.waitForDeployment();
  const address = await certificate.getAddress();
  
  console.log("Certificate deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### **Step 5: Backend Service**

**backend/src/modules/blockchain/blockchain.service.ts:**
```typescript
import { ethers } from 'ethers';
import { Certificate } from '../../contracts/Certificate.sol'; // Import ABI

export class BlockchainService {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    // Local Hardhat network
    this.provider = new ethers.JsonRpcProvider('http://localhost:8545');
    
    // Testnet (Sepolia)
    // this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, this.provider);
    
    const contractAddress = process.env.CERTIFICATE_CONTRACT_ADDRESS!;
    const abi = [/* Certificate ABI */];
    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);
  }

  async issueCertificate(
    recipientAddress: string,
    courseId: string,
    certificateHash: string
  ): Promise<string> {
    const tx = await this.contract.issueCertificate(
      recipientAddress,
      courseId,
      certificateHash
    );
    await tx.wait();
    
    // Get certificate ID from event
    const receipt = await this.provider.getTransactionReceipt(tx.hash);
    // Parse events...
    
    return certificateId;
  }

  async verifyCertificate(certificateId: string): Promise<boolean> {
    const [isValid] = await this.contract.verifyCertificate(certificateId);
    return isValid;
  }
}
```

---

## 🔐 Environment Variables

**.env:**
```bash
# Blockchain
BLOCKCHAIN_NETWORK=hardhat  # hoặc sepolia, mumbai
PRIVATE_KEY=your_private_key_here
CERTIFICATE_CONTRACT_ADDRESS=0x...

# RPC URLs (cho testnet)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# IPFS (Pinata free tier)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret
```

---

## 📝 IPFS Integration (Free Tier)

### **Pinata (Recommended)**
- ✅ Free tier: 1GB storage, unlimited requests
- ✅ Easy API
- ✅ Good for certificates storage

**Setup:**
```bash
npm install pinata-sdk
```

**Usage:**
```typescript
import pinataSDK from '@pinata/sdk';

const pinata = pinataSDK(process.env.PINATA_API_KEY!, process.env.PINATA_SECRET_KEY!);

async function uploadCertificate(certificateData: any) {
  const result = await pinata.pinJSONToIPFS(certificateData);
  return result.IpfsHash;
}
```

---

## 🧪 Testing

**test/Certificate.test.ts:**
```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Certificate", function () {
  it("Should issue and verify certificate", async function () {
    const Certificate = await ethers.getContractFactory("Certificate");
    const certificate = await Certificate.deploy();
    
    const [owner, recipient] = await ethers.getSigners();
    
    const tx = await certificate.issueCertificate(
      recipient.address,
      "COURSE_001",
      "QmHash..."
    );
    await tx.wait();
    
    // Verify...
  });
});
```

---

## 🚀 Quick Start Commands

```bash
# Start local Hardhat node
npx hardhat node

# Compile contracts
npx hardhat compile

# Deploy to local
npx hardhat run scripts/deploy.ts --network localhost

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Run tests
npx hardhat test
```

---

## 💰 Cost Comparison

| Solution | Dev Cost | Test Cost | Production Cost |
|----------|----------|-----------|-----------------|
| **Hardhat (Local)** | $0 | $0 | N/A |
| **Sepolia Testnet** | $0 | $0 | ~$50-100/month |
| **Mumbai Testnet** | $0 | $0 | ~$20-50/month |
| **Base Testnet** | $0 | $0 | ~$30-80/month |

**Recommendation:**
- **Development:** Hardhat (local)
- **Testing:** Sepolia hoặc Mumbai
- **Production:** Polygon (mainnet) - gas fees thấp nhất

---

## 📚 Resources

- [Hardhat Docs](https://hardhat.org/docs)
- [Ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Pinata Docs](https://docs.pinata.cloud/)
- [MetaMask Docs](https://docs.metamask.io/)

---

## ✅ Next Steps

1. ✅ Setup Hardhat local blockchain
2. ✅ Create Certificate smart contract
3. ✅ Deploy to local network
4. ✅ Integrate với backend service
5. ✅ Test với MetaMask
6. ✅ Deploy to Sepolia testnet
7. ✅ Integrate IPFS cho certificate storage

---

**Lưu ý:** Tất cả các giải pháp trên đều **hoàn toàn miễn phí** cho development và testing. Chỉ tốn phí khi deploy lên mainnet (production).

