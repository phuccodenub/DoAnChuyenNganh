# 🆓 Blockchain Miễn Phí - Có Thể Search/Verify Công Khai

## 🎯 Yêu Cầu: Dev/Test Miễn Phí + Search Được Công Khai

Bạn cần:
- ✅ **Hoàn toàn miễn phí** - Không tốn bất kỳ chi phí nào
- ✅ **Có thể search/verify công khai** - Trên blockchain explorers
- ✅ **Có thể view trên OpenSea** - NFT marketplaces

---

## ✅ **Giải Pháp: Public Testnets**

### **Khác Biệt Quan Trọng:**

| Loại | Local Blockchain | Public Testnet | Public Mainnet |
|------|------------------|----------------|----------------|
| **Cost** | $0 | $0 | ~$0.01-50 |
| **Search công khai** | ❌ Không | ✅ **CÓ** | ✅ Có |
| **Explorer** | ❌ Không có | ✅ **CÓ** | ✅ Có |
| **OpenSea** | ❌ Không | ✅ **Testnet** | ✅ Mainnet |
| **Internet** | ❌ Không cần | ✅ Cần | ✅ Cần |

**Kết luận:** Để **miễn phí + search được công khai**, bạn **PHẢI** dùng **Public Testnets**.

---

## 🌟 **Recommended: Polygon Mumbai Testnet** ⭐⭐⭐

### **Tại Sao Chọn Mumbai?**

1. ✅ **Hoàn toàn miễn phí** - Không tốn bất kỳ chi phí nào
2. ✅ **Có thể verify trên Mumbai Polygonscan**: https://mumbai.polygonscan.com/
3. ✅ **Có thể search công khai** - Mọi người có thể verify certificates
4. ✅ **Có thể view trên OpenSea Testnet**: https://testnets.opensea.io/
5. ✅ **Gas fees = 0** - Testnet tokens miễn phí
6. ✅ **Fast** - ~2-3 seconds
7. ✅ **Giống hệt mainnet** - Code và functionality giống nhau

---

## 🚀 Setup Nhanh (5 phút)

### **Step 1: Install Dependencies**

```bash
cd backend
npm install ethers@^6.0.0
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts
```

### **Step 2: Setup Hardhat Config**

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
    // Local blockchain (chỉ cho dev, không search được)
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // Mumbai Testnet - MIỄN PHÍ + SEARCH ĐƯỢC CÔNG KHAI ⭐
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001
    },
    // Sepolia Testnet - MIỄN PHÍ + SEARCH ĐƯỢC CÔNG KHAI ⭐
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    }
  }
};

export default config;
```

### **Step 3: Lấy Test Tokens Miễn Phí**

#### **Mumbai (Polygon Testnet):**
1. Vào https://faucet.polygon.technology/
2. Chọn "Mumbai" network
3. Nhập wallet address
4. Nhận test MATIC miễn phí

#### **Sepolia (Ethereum Testnet):**
1. Vào https://sepoliafaucet.com/
2. Nhập wallet address
3. Nhận test ETH miễn phí

### **Step 4: Deploy Contract Lên Testnet**

```bash
# Deploy to Mumbai (Polygon Testnet)
npx hardhat run scripts/deploy.ts --network mumbai

# Hoặc Sepolia (Ethereum Testnet)
npx hardhat run scripts/deploy.ts --network sepolia
```

### **Step 5: Verify & Search**

Sau khi deploy, bạn sẽ nhận được:
- **Contract Address** - Ví dụ: `0x1234...`
- **Transaction Hash** - Ví dụ: `0xabcd...`

**Search trên Explorer:**
- Mumbai: https://mumbai.polygonscan.com/address/0x1234...
- Sepolia: https://sepolia.etherscan.io/address/0x1234...

**View trên OpenSea Testnet:**
- Mumbai: https://testnets.opensea.io/assets/mumbai/0x1234.../1
- Sepolia: https://testnets.opensea.io/assets/sepolia/0x1234.../1

---

## 📝 Example: Certificate NFT Contract

**contracts/CertificateNFT.sol:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    struct CertificateData {
        address recipient;
        string courseId;
        string courseName;
        uint256 issuedAt;
        bool revoked;
    }
    
    mapping(uint256 => CertificateData) public certificates;
    mapping(address => uint256[]) public userCertificates;
    
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        string courseId,
        string courseName
    );
    
    constructor() ERC721("LMS Certificate", "LMSCERT") Ownable(msg.sender) {}
    
    function issueCertificate(
        address recipient,
        string memory courseId,
        string memory courseName,
        string memory tokenURI  // IPFS hash: ipfs://QmHash...
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        certificates[tokenId] = CertificateData({
            recipient: recipient,
            courseId: courseId,
            courseName: courseName,
            issuedAt: block.timestamp,
            revoked: false
        });
        
        userCertificates[recipient].push(tokenId);
        
        emit CertificateIssued(tokenId, recipient, courseId, courseName);
        return tokenId;
    }
    
    function verifyCertificate(uint256 tokenId) 
        public 
        view 
        returns (bool, CertificateData memory) 
    {
        CertificateData memory cert = certificates[tokenId];
        bool isValid = cert.recipient != address(0) && !cert.revoked && _ownerOf(tokenId) == cert.recipient;
        return (isValid, cert);
    }
    
    function getUserCertificates(address user) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return userCertificates[user];
    }
    
    function revokeCertificate(uint256 tokenId) public onlyOwner {
        require(certificates[tokenId].recipient != address(0), "Certificate not found");
        certificates[tokenId].revoked = true;
    }
}
```

### **Deploy Script**

**scripts/deploy.ts:**
```typescript
import { ethers } from "hardhat";

async function main() {
  const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
  const certificateNFT = await CertificateNFT.deploy();
  
  await certificateNFT.waitForDeployment();
  const address = await certificateNFT.getAddress();
  
  console.log("✅ CertificateNFT deployed to:", address);
  console.log("🔍 View on explorer:");
  console.log(`   Mumbai: https://mumbai.polygonscan.com/address/${address}`);
  console.log(`   Sepolia: https://sepolia.etherscan.io/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## 🔐 Environment Variables

**.env:**
```bash
# Blockchain Network
BLOCKCHAIN_NETWORK=mumbai  # hoặc sepolia

# Private Key (từ MetaMask hoặc tạo mới)
PRIVATE_KEY=your_private_key_here

# RPC URLs (Free tier)
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
# Hoặc dùng Alchemy free tier:
# MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY

SEPOLIA_RPC_URL=https://rpc.sepolia.org
# Hoặc dùng Alchemy free tier:
# SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Contract Address (sau khi deploy)
CERTIFICATE_CONTRACT_ADDRESS=0x...

# IPFS (Pinata free tier)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret
```

---

## 🔍 Cách Search/Verify Trên Testnet Explorers

### **1. Mumbai Polygonscan**

```
1. Vào https://mumbai.polygonscan.com/
2. Search bằng:
   - Contract address: 0x1234...
   - Transaction hash: 0xabcd...
   - Token ID: 1, 2, 3...
   - Wallet address: 0x5678...
3. Xem transaction history
4. Verify contract source code (optional)
```

### **2. Sepolia Etherscan**

```
1. Vào https://sepolia.etherscan.io/
2. Search tương tự Mumbai Polygonscan
3. Có thể verify contract để xem source code
```

### **3. OpenSea Testnet**

```
1. Vào https://testnets.opensea.io/
2. Chọn network: Mumbai hoặc Sepolia
3. Search bằng:
   - Collection address
   - Token ID
   - Wallet address
4. View NFT metadata và image
5. Share link công khai
```

---

## 📝 Backend Service Example

**backend/src/modules/blockchain/blockchain.service.ts:**
```typescript
import { ethers } from 'ethers';

export class BlockchainService {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private network: 'mumbai' | 'sepolia';

  constructor() {
    this.network = (process.env.BLOCKCHAIN_NETWORK as 'mumbai' | 'sepolia') || 'mumbai';
    
    // Mumbai Testnet (Polygon)
    if (this.network === 'mumbai') {
      this.provider = new ethers.JsonRpcProvider(
        process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com'
      );
    } 
    // Sepolia Testnet (Ethereum)
    else {
      this.provider = new ethers.JsonRpcProvider(
        process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'
      );
    }
    
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, this.provider);
    
    const contractAddress = process.env.CERTIFICATE_CONTRACT_ADDRESS!;
    const abi = [/* Certificate ABI */];
    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);
  }

  async issueCertificate(
    recipientAddress: string,
    courseId: string,
    courseName: string,
    ipfsHash: string
  ): Promise<{ 
    tokenId: string; 
    txHash: string; 
    explorerUrl: string;
    openseaUrl: string;
  }> {
    const tx = await this.contract.issueCertificate(
      recipientAddress,
      courseId,
      courseName,
      `ipfs://${ipfsHash}`
    );
    
    const receipt = await tx.wait();
    
    // Extract tokenId from event
    const event = receipt.logs.find((log: any) => 
      log.topics[0] === ethers.id("CertificateIssued(uint256,address,string,string)")
    );
    const tokenId = event ? BigInt(event.topics[1]).toString() : '0';
    
    const contractAddress = await this.contract.getAddress();
    
    return {
      tokenId,
      txHash: receipt.hash,
      explorerUrl: this.getExplorerUrl(receipt.hash),
      openseaUrl: this.getOpenSeaUrl(contractAddress, tokenId)
    };
  }

  getExplorerUrl(txHash: string): string {
    if (this.network === 'mumbai') {
      return `https://mumbai.polygonscan.com/tx/${txHash}`;
    } else {
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    }
  }

  getOpenSeaUrl(contractAddress: string, tokenId: string): string {
    if (this.network === 'mumbai') {
      return `https://testnets.opensea.io/assets/mumbai/${contractAddress}/${tokenId}`;
    } else {
      return `https://testnets.opensea.io/assets/sepolia/${contractAddress}/${tokenId}`;
    }
  }

  async verifyCertificate(tokenId: string): Promise<boolean> {
    const [isValid] = await this.contract.verifyCertificate(tokenId);
    return isValid;
  }
}
```

---

## ✅ Checklist Setup

- [ ] Install dependencies (`ethers`, `hardhat`)
- [ ] Setup Hardhat config với Mumbai/Sepolia networks
- [ ] Tạo wallet và lấy test tokens từ faucet
- [ ] Deploy contract lên testnet
- [ ] Verify contract trên explorer (optional)
- [ ] Test issue certificate
- [ ] Test search trên explorer
- [ ] Test view trên OpenSea testnet

---

## 🎯 Kết Luận

**Để dev/test miễn phí + search được công khai:**

1. ✅ **Dùng Public Testnets** (Mumbai hoặc Sepolia)
2. ✅ **KHÔNG dùng Local Blockchain** (Hardhat local) - Không search được công khai
3. ✅ **Testnets có explorers công khai** - Mọi người có thể verify
4. ✅ **Testnets có OpenSea testnet** - Có thể view NFTs

**Recommendation:** **Mumbai Testnet (Polygon)** - Gas fees thấp nhất, fast, được support rộng rãi.

---

## 📚 Resources

- **Mumbai Polygonscan**: https://mumbai.polygonscan.com/
- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **OpenSea Testnet**: https://testnets.opensea.io/
- **Mumbai Faucet**: https://faucet.polygon.technology/
- **Sepolia Faucet**: https://sepoliafaucet.com/

---

**Lưu ý:** Testnets hoàn toàn miễn phí và có thể search/verify công khai, nhưng chỉ dùng cho dev/test. Khi lên production, bạn sẽ cần deploy lên mainnet (tốn phí gas).

