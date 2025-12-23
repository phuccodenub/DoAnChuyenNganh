/**
 * ProxyPal Health Check Service
 * 
 * Monitors ProxyPal availability for heavy AI tasks
 * - Checks ProxyPal server status
 * - Caches health status
 * - Provides availability info for analysis queue
 */

import logger from '../../../utils/logger.util';

interface ProxyPalHealthStatus {
  isOnline: boolean;
  lastCheckTime: number;
  responseTime: number | null;
  availableModels: string[];
  error: string | null;
}

class ProxyPalHealthCheckService {
  private static instance: ProxyPalHealthCheckService;
  private healthStatus: ProxyPalHealthStatus = {
    isOnline: false,
    lastCheckTime: 0,
    responseTime: null,
    availableModels: [],
    error: null,
  };
  
  private checkInterval = 300000; // 5 minutes cache (reduced from 30s to avoid log spam)
  // Use PROXYPAL_BASE_URL from .env, normalize to remove /v1 suffix (will add in API calls)
  // IMPORTANT: Use 127.0.0.1 instead of localhost to avoid IPv6 issues in Node.js 17+
  // NOTE: Do NOT replace host.docker.internal - it's needed when running in Docker to access host machine
  private proxypalUrl = (process.env.PROXYPAL_BASE_URL || 'http://127.0.0.1:8317/v1')
    .replace(/\/v1\/?$/, '') // Remove /v1 suffix
    .replace('localhost', '127.0.0.1'); // Replace localhost only
  private proxypalApiKey = process.env.PROXYPAL_API_KEY || 'proxypal-local';
  private timeout = 5000; // 5 seconds timeout

  private constructor() {
    // Start periodic health checks
    this.startPeriodicHealthCheck();
  }

  static getInstance(): ProxyPalHealthCheckService {
    if (!ProxyPalHealthCheckService.instance) {
      ProxyPalHealthCheckService.instance = new ProxyPalHealthCheckService();
    }
    return ProxyPalHealthCheckService.instance;
  }

  /**
   * Check ProxyPal server status
   */
  async checkStatus(): Promise<ProxyPalHealthStatus> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add API key if provided (same as ProxyPalProvider)
      if (this.proxypalApiKey) {
        headers['Authorization'] = `Bearer ${this.proxypalApiKey}`;
      }

      const response = await fetch(`${this.proxypalUrl}/v1/models`, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json() as { data?: { id: string }[] };
        const models = data.data?.map((m) => m.id) || [];
        
        this.healthStatus = {
          isOnline: true,
          lastCheckTime: Date.now(),
          responseTime: Date.now() - startTime,
          availableModels: models,
          error: null,
        };

        logger.info(`[ProxyPalHealth] ✅ Online - ${models.length} models available (${this.healthStatus.responseTime}ms)`);
        return this.healthStatus;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      this.healthStatus = {
        isOnline: false,
        lastCheckTime: Date.now(),
        responseTime: null,
        availableModels: [],
        error: error.message || 'Connection failed',
      };

      logger.warn(`[ProxyPalHealth] ❌ Offline - ${this.healthStatus.error}`);
      return this.healthStatus;
    }
  }

  /**
   * Get current availability (with cache)
   */
  async isAvailable(): Promise<boolean> {
    const now = Date.now();
    const timeSinceLastCheck = now - this.healthStatus.lastCheckTime;

    // Return cached result if still fresh
    if (timeSinceLastCheck < this.checkInterval) {
      return this.healthStatus.isOnline;
    }

    // Re-check status
    const status = await this.checkStatus();
    return status.isOnline;
  }

  /**
   * Get full health status
   */
  getHealthStatus(): ProxyPalHealthStatus {
    return { ...this.healthStatus };
  }

  /**
   * Check if a specific model is available
   */
  async isModelAvailable(modelName: string): Promise<boolean> {
    await this.isAvailable();
    return this.healthStatus.availableModels.includes(modelName);
  }

  /**
   * Start periodic health checks (every 30s)
   */
  private startPeriodicHealthCheck(): void {
    // Initial check
    this.checkStatus().catch((error) => {
      logger.error('[ProxyPalHealth] Initial health check failed:', error);
    });

    // Periodic checks
    setInterval(() => {
      this.checkStatus().catch((error) => {
        logger.error('[ProxyPalHealth] Periodic health check failed:', error);
      });
    }, this.checkInterval);

    logger.info('[ProxyPalHealth] Periodic health check started (5min interval)');
  }

  /**
   * Force immediate health check
   */
  async forceCheck(): Promise<boolean> {
    const status = await this.checkStatus();
    return status.isOnline;
  }
}

// Export singleton instance
export const proxyPalHealthCheck = ProxyPalHealthCheckService.getInstance();
export default ProxyPalHealthCheckService;
