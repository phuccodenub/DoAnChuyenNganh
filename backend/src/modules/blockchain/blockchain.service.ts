/**
 * Blockchain Service
 * Service để interact với Certificate NFT smart contract trên blockchain
 */

import { ethers } from 'ethers';
import logger from '../../utils/logger.util';
import { env } from '../../config/env.config';

// Certificate NFT Contract ABI (sẽ được generate từ Hardhat)
const CERTIFICATE_NFT_ABI = [
  "function issueCertificate(address recipient, string memory courseId, string memory courseName, string memory tokenURI) external returns (uint256)",
  "function verifyCertificate(uint256 tokenId) external view returns (bool, tuple(address recipient, string courseId, string courseName, uint256 issuedAt, bool revoked))",
  "function getUserCertificates(address user) external view returns (uint256[])",
  "function getCourseCertificates(string memory courseId) external view returns (uint256[])",
  "function revokeCertificate(uint256 tokenId, string memory reason) external",
  "function getCertificate(uint256 tokenId) external view returns (tuple(address recipient, string courseId, string courseName, uint256 issuedAt, bool revoked))",
  "function totalSupply() external view returns (uint256)",
  "event CertificateIssued(uint256 indexed tokenId, address indexed recipient, string courseId, string courseName, string tokenURI)",
  "event CertificateRevoked(uint256 indexed tokenId, address indexed recipient, string reason)"
];

export interface IssueCertificateParams {
  recipientAddress: string;
  courseId: string;
  courseName: string;
  tokenURI: string; // IPFS hash: ipfs://QmHash...
}

export interface CertificateOnChain {
  recipient: string;
  courseId: string;
  courseName: string;
  issuedAt: bigint;
  revoked: boolean;
}

export interface IssueCertificateResult {
  tokenId: string;
  txHash: string;
  explorerUrl: string;
  openseaUrl: string;
  blockNumber: number;
}

export class BlockchainService {
  private provider: ethers.Provider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;
  private network: 'mumbai' | 'amoy' | 'sepolia' | 'hardhat' | 'localhost' | null = null;
  private contractAddress: string | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    try {
      const network = (process.env.BLOCKCHAIN_NETWORK || 'amoy') as 'mumbai' | 'amoy' | 'sepolia' | 'hardhat' | 'localhost';
      this.network = network;
      this.contractAddress = process.env.CERTIFICATE_CONTRACT_ADDRESS || null;

      if (!this.contractAddress) {
        logger.warn('[BlockchainService] CERTIFICATE_CONTRACT_ADDRESS not set, blockchain features disabled');
        return;
      }

      // Initialize provider based on network
      if (network === 'mumbai') {
        const rpcUrl = process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com';
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
      } else if (network === 'amoy') {
        // Amoy Testnet (Polygon testnet mới, thay thế Mumbai)
        const rpcUrl = process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
      } else if (network === 'sepolia') {
        const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
      } else if (network === 'hardhat' || network === 'localhost') {
        this.provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
      } else {
        logger.warn(`[BlockchainService] Unknown network: ${network}`);
        return;
      }

      // Initialize wallet
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        logger.warn('[BlockchainService] PRIVATE_KEY not set, blockchain features disabled');
        return;
      }

      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Initialize contract
      this.contract = new ethers.Contract(
        this.contractAddress,
        CERTIFICATE_NFT_ABI,
        this.wallet
      );

      logger.info(`[BlockchainService] Initialized for network: ${network}, contract: ${this.contractAddress}`);
    } catch (error) {
      logger.error('[BlockchainService] Initialization error:', error);
    }
  }

  /**
   * Check if blockchain service is available
   */
  isAvailable(): boolean {
    return this.provider !== null && this.wallet !== null && this.contract !== null;
  }

  /**
   * Issue a certificate NFT on blockchain
   */
  async issueCertificate(params: IssueCertificateParams): Promise<IssueCertificateResult> {
    if (!this.isAvailable()) {
      throw new Error('Blockchain service is not available. Check configuration.');
    }

    try {
      logger.info(`[BlockchainService] Issuing certificate for ${params.recipientAddress}, course: ${params.courseId}`);

      // Call smart contract
      const tx = await this.contract!.issueCertificate(
        params.recipientAddress,
        params.courseId,
        params.courseName,
        params.tokenURI
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }

      // Extract tokenId from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsedLog = this.contract!.interface.parseLog(log);
          return parsedLog?.name === 'CertificateIssued';
        } catch {
          return false;
        }
      });

      let tokenId = '0';
      if (event) {
        try {
          const parsedLog = this.contract!.interface.parseLog(event);
          tokenId = parsedLog?.args[0].toString() || '0';
        } catch (error) {
          logger.warn('[BlockchainService] Could not parse tokenId from event, using fallback');
          // Fallback: query totalSupply before and after
          const totalSupplyBefore = await this.contract!.totalSupply();
          tokenId = (Number(totalSupplyBefore) - 1).toString();
        }
      } else {
        // Fallback: use totalSupply - 1
        const totalSupply = await this.contract!.totalSupply();
        tokenId = (Number(totalSupply) - 1).toString();
      }

      const result: IssueCertificateResult = {
        tokenId,
        txHash: receipt.hash,
        explorerUrl: this.getExplorerUrl(receipt.hash),
        openseaUrl: this.getOpenSeaUrl(this.contractAddress!, tokenId),
        blockNumber: Number(receipt.blockNumber)
      };

      logger.info(`[BlockchainService] Certificate issued successfully: tokenId=${tokenId}, txHash=${receipt.hash}`);
      return result;
    } catch (error: any) {
      logger.error('[BlockchainService] Error issuing certificate:', error);
      throw new Error(`Failed to issue certificate on blockchain: ${error.message}`);
    }
  }

  /**
   * Verify a certificate on blockchain
   */
  async verifyCertificate(tokenId: string): Promise<{ valid: boolean; certificate?: CertificateOnChain }> {
    if (!this.isAvailable()) {
      throw new Error('Blockchain service is not available');
    }

    try {
      const [isValid, cert] = await this.contract!.verifyCertificate(tokenId);
      
      if (!isValid || !cert) {
        return { valid: false };
      }

      return {
        valid: true,
        certificate: {
          recipient: cert.recipient,
          courseId: cert.courseId,
          courseName: cert.courseName,
          issuedAt: cert.issuedAt,
          revoked: cert.revoked
        }
      };
    } catch (error: any) {
      logger.error(`[BlockchainService] Error verifying certificate ${tokenId}:`, error);
      return { valid: false };
    }
  }

  /**
   * Get all certificates for a user
   */
  async getUserCertificates(userAddress: string): Promise<string[]> {
    if (!this.isAvailable()) {
      throw new Error('Blockchain service is not available');
    }

    try {
      const tokenIds = await this.contract!.getUserCertificates(userAddress);
      return tokenIds.map((id: bigint) => id.toString());
    } catch (error: any) {
      logger.error(`[BlockchainService] Error getting user certificates:`, error);
      throw new Error(`Failed to get user certificates: ${error.message}`);
    }
  }

  /**
   * Get all certificates for a course
   */
  async getCourseCertificates(courseId: string): Promise<string[]> {
    if (!this.isAvailable()) {
      throw new Error('Blockchain service is not available');
    }

    try {
      const tokenIds = await this.contract!.getCourseCertificates(courseId);
      return tokenIds.map((id: bigint) => id.toString());
    } catch (error: any) {
      logger.error(`[BlockchainService] Error getting course certificates:`, error);
      throw new Error(`Failed to get course certificates: ${error.message}`);
    }
  }

  /**
   * Revoke a certificate
   */
  async revokeCertificate(tokenId: string, reason: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Blockchain service is not available');
    }

    try {
      const tx = await this.contract!.revokeCertificate(tokenId, reason);
      const receipt = await tx.wait();
      logger.info(`[BlockchainService] Certificate ${tokenId} revoked, txHash: ${receipt.hash}`);
      return receipt.hash;
    } catch (error: any) {
      logger.error(`[BlockchainService] Error revoking certificate:`, error);
      throw new Error(`Failed to revoke certificate: ${error.message}`);
    }
  }

  /**
   * Get explorer URL for transaction
   */
  getExplorerUrl(txHash: string): string {
    if (this.network === 'mumbai') {
      return `https://mumbai.polygonscan.com/tx/${txHash}`;
    } else if (this.network === 'amoy') {
      return `https://amoy.polygonscan.com/tx/${txHash}`;
    } else if (this.network === 'sepolia') {
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    } else {
      return `#${txHash}`; // Local network
    }
  }

  /**
   * Get OpenSea URL for NFT
   * Note: OpenSea has discontinued testnet support, so for testnets we return explorer URL instead
   */
  getOpenSeaUrl(contractAddress: string, tokenId: string): string {
    // OpenSea đã ngừng hỗ trợ testnet, nên dùng blockchain explorer cho testnet
    if (this.network === 'mumbai') {
      // Return Polygonscan NFT page instead
      return `https://mumbai.polygonscan.com/token/${contractAddress}?a=${tokenId}`;
    } else if (this.network === 'amoy') {
      // Return Polygonscan NFT page instead
      return `https://amoy.polygonscan.com/token/${contractAddress}?a=${tokenId}`;
    } else if (this.network === 'sepolia') {
      // Return Etherscan NFT token page (better format for viewing NFT)
      // Format: https://sepolia.etherscan.io/token/{contractAddress}?a={tokenId}
      return `https://sepolia.etherscan.io/token/${contractAddress}?a=${tokenId}`;
    } else {
      // For mainnet, still return OpenSea URL (if needed in future)
      // For now, return explorer URL
      return `#${contractAddress}/${tokenId}`; // Local network
    }
  }

  /**
   * Get blockchain explorer NFT URL (recommended for testnets)
   */
  getExplorerNftUrl(contractAddress: string, tokenId: string): string {
    if (this.network === 'mumbai') {
      return `https://mumbai.polygonscan.com/token/${contractAddress}?a=${tokenId}`;
    } else if (this.network === 'amoy') {
      return `https://amoy.polygonscan.com/token/${contractAddress}?a=${tokenId}`;
    } else if (this.network === 'sepolia') {
      return `https://sepolia.etherscan.io/token/${contractAddress}?a=${tokenId}`;
    } else {
      return `#${contractAddress}/${tokenId}`; // Local network
    }
  }

  /**
   * Get contract address
   */
  getContractAddress(): string | null {
    return this.contractAddress;
  }

  /**
   * Get network name
   */
  getNetwork(): string | null {
    return this.network;
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();


