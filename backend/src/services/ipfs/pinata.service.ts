/**
 * Pinata IPFS Service
 * Service để upload và retrieve metadata từ Pinata IPFS
 */

import axios from 'axios';
import FormData from 'form-data';
import env from '../../config/env.config';
import logger from '../../utils/logger.util';

export interface IPFSUploadResult {
  ipfsHash: string;
  pinSize: number;
  timestamp: string;
}

export interface IPFSMetadata {
  name?: string;
  keyvalues?: Record<string, any>;
}

export class PinataService {
  private apiKey: string;
  private secretKey: string;
  private gatewayUrl: string;
  private baseUrl = 'https://api.pinata.cloud';

  constructor() {
    this.apiKey = env.ipfs.pinata.apiKey;
    this.secretKey = env.ipfs.pinata.secretKey;
    this.gatewayUrl = env.ipfs.pinata.gatewayUrl;

    if (!this.apiKey || !this.secretKey) {
      logger.warn('[PinataService] Pinata API keys not configured - IPFS features will be disabled');
    }
  }

  /**
   * Check if Pinata service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey && !!this.secretKey;
  }

  /**
   * Upload JSON data to IPFS via Pinata
   */
  async uploadJSON(data: any, metadata?: IPFSMetadata): Promise<IPFSUploadResult> {
    if (!this.isAvailable()) {
      throw new Error('Pinata service is not available. Please configure PINATA_API_KEY and PINATA_SECRET_KEY.');
    }

    try {
      // Convert data to JSON string
      const jsonString = JSON.stringify(data);
      const jsonBuffer = Buffer.from(jsonString, 'utf-8');

      // Create form data
      const formData = new FormData();
      formData.append('file', jsonBuffer, {
        filename: 'certificate-metadata.json',
        contentType: 'application/json',
      });

      // Add metadata if provided
      if (metadata) {
        formData.append('pinataMetadata', JSON.stringify(metadata));
      }

      // Add options
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 1,
      }));

      // Upload to Pinata
      const response = await axios.post(
        `${this.baseUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            pinata_api_key: this.apiKey,
            pinata_secret_api_key: this.secretKey,
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      const result: IPFSUploadResult = {
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
      };

      logger.info(`[PinataService] Successfully uploaded to IPFS: ${result.ipfsHash}`);
      return result;
    } catch (error: any) {
      logger.error('[PinataService] Error uploading to IPFS:', error.response?.data || error.message);
      throw new Error(`Failed to upload to IPFS: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Retrieve JSON data from IPFS via Pinata gateway
   */
  async retrieveJSON(ipfsHash: string): Promise<any> {
    try {
      const url = `${this.gatewayUrl}${ipfsHash}`;
      const response = await axios.get(url, {
        timeout: 10000,
      });

      return response.data;
    } catch (error: any) {
      logger.error(`[PinataService] Error retrieving from IPFS (${ipfsHash}):`, error.message);
      throw new Error(`Failed to retrieve from IPFS: ${error.message}`);
    }
  }

  /**
   * Get IPFS gateway URL for a hash
   */
  getGatewayUrl(ipfsHash: string): string {
    return `${this.gatewayUrl}${ipfsHash}`;
  }
}

export const pinataService = new PinataService();

