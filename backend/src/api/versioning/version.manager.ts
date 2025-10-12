/**
 * API Version Manager
 * Manages API versions and routing
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger.util';

export interface ApiVersion {
  version: string;
  status: 'stable' | 'beta' | 'deprecated' | 'sunset';
  releaseDate: Date;
  sunsetDate?: Date;
  description?: string;
  changes?: string[];
  breakingChanges?: string[];
  migrationGuide?: string;
}

export interface VersionConfig {
  defaultVersion: string;
  supportedVersions: string[];
  versions: Map<string, ApiVersion>;
  deprecationWarningDays: number;
  sunsetWarningDays: number;
}

export class VersionManager {
  private config: VersionConfig;
  private versionRegex = /^v(\d+)\.(\d+)\.(\d+)$/;

  constructor(config: VersionConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * Validate version configuration
   */
  private validateConfig(): void {
    if (!this.config.defaultVersion) {
      throw new Error('Default version is required');
    }

    if (!this.config.supportedVersions.includes(this.config.defaultVersion)) {
      throw new Error('Default version must be in supported versions');
    }

    // Validate version format
    for (const version of this.config.supportedVersions) {
      if (!this.isValidVersionFormat(version)) {
        throw new Error(`Invalid version format: ${version}`);
      }
    }

    logger.info('API version configuration validated', {
      defaultVersion: this.config.defaultVersion,
      supportedVersions: this.config.supportedVersions,
      totalVersions: this.config.versions.size
    });
  }

  /**
   * Check if version format is valid
   */
  private isValidVersionFormat(version: string): boolean {
    return this.versionRegex.test(version);
  }

  /**
   * Parse version string
   */
  private parseVersion(version: string): { major: number; minor: number; patch: number } | null {
    const match = version.match(this.versionRegex);
    if (!match) return null;

    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3])
    };
  }

  /**
   * Compare two versions
   */
  private compareVersions(version1: string, version2: string): number {
    const v1 = this.parseVersion(version1);
    const v2 = this.parseVersion(version2);

    if (!v1 || !v2) return 0;

    if (v1.major !== v2.major) return v1.major - v2.major;
    if (v1.minor !== v2.minor) return v1.minor - v2.minor;
    return v1.patch - v2.patch;
  }

  /**
   * Extract version from request
   */
  public extractVersion(req: Request): string {
    // Check URL path first (e.g., /api/v1/users)
    const pathVersion = req.path.match(/^\/api\/(v\d+\.\d+\.\d+)\//);
    if (pathVersion) {
      return pathVersion[1];
    }

    // Check query parameter
    const queryVersion = req.query.version as string;
    if (queryVersion && this.isValidVersionFormat(queryVersion)) {
      return queryVersion;
    }

    // Check header
    const headerVersion = req.headers['api-version'] as string;
    if (headerVersion && this.isValidVersionFormat(headerVersion)) {
      return headerVersion;
    }

    // Check Accept header
    const acceptHeader = req.headers.accept;
    if (acceptHeader) {
      const versionMatch = acceptHeader.match(/version=([^;,\s]+)/);
      if (versionMatch && this.isValidVersionFormat(versionMatch[1])) {
        return versionMatch[1];
      }
    }

    return this.config.defaultVersion;
  }

  /**
   * Check if version is supported
   */
  public isVersionSupported(version: string): boolean {
    return this.config.supportedVersions.includes(version);
  }

  /**
   * Get version info
   */
  public getVersionInfo(version: string): ApiVersion | null {
    return this.config.versions.get(version) || null;
  }

  /**
   * Get latest stable version
   */
  public getLatestStableVersion(): string | null {
    const stableVersions = Array.from(this.config.versions.entries())
      .filter(([_, info]) => info.status === 'stable')
      .sort(([a], [b]) => this.compareVersions(b, a));

    return stableVersions.length > 0 ? stableVersions[0][0] : null;
  }

  /**
   * Get version status
   */
  public getVersionStatus(version: string): ApiVersion['status'] | null {
    const versionInfo = this.getVersionInfo(version);
    return versionInfo ? versionInfo.status : null;
  }

  /**
   * Check if version is deprecated
   */
  public isVersionDeprecated(version: string): boolean {
    const versionInfo = this.getVersionInfo(version);
    return versionInfo ? ['deprecated', 'sunset'].includes(versionInfo.status) : false;
  }

  /**
   * Check if version is sunset
   */
  public isVersionSunset(version: string): boolean {
    const versionInfo = this.getVersionInfo(version);
    return versionInfo ? versionInfo.status === 'sunset' : false;
  }

  /**
   * Get deprecation warning
   */
  public getDeprecationWarning(version: string): string | null {
    const versionInfo = this.getVersionInfo(version);
    if (!versionInfo || !['deprecated', 'sunset'].includes(versionInfo.status)) {
      return null;
    }

    const latestStable = this.getLatestStableVersion();
    if (!latestStable) return null;

    let warning = `API version ${version} is ${versionInfo.status}.`;
    
    if (versionInfo.status === 'deprecated') {
      warning += ` Please migrate to ${latestStable}.`;
    } else if (versionInfo.status === 'sunset') {
      warning += ` This version will be removed on ${versionInfo.sunsetDate?.toISOString()}.`;
    }

    if (versionInfo.migrationGuide) {
      warning += ` Migration guide: ${versionInfo.migrationGuide}`;
    }

    return warning;
  }

  /**
   * Middleware to handle versioning
   */
  public versionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const version = this.extractVersion(req);
      
      // Check if version is supported
      if (!this.isVersionSupported(version)) {
        res.status(400).json({
          success: false,
          error: 'Unsupported API version',
          message: `Version ${version} is not supported. Supported versions: ${this.config.supportedVersions.join(', ')}`,
          supportedVersions: this.config.supportedVersions,
          defaultVersion: this.config.defaultVersion
        });
        return;
      }

      // Add version to request
      (req as any).apiVersion = version;
      (req as any).versionInfo = this.getVersionInfo(version);

      // Add deprecation warning headers
      const deprecationWarning = this.getDeprecationWarning(version);
      if (deprecationWarning) {
        res.set('X-API-Deprecation-Warning', deprecationWarning);
        
        if (this.isVersionSunset(version)) {
          res.set('X-API-Sunset-Date', this.getVersionInfo(version)?.sunsetDate?.toISOString() || '');
        }
      }

      // Add version headers
      res.set('X-API-Version', version);
      res.set('X-API-Supported-Versions', this.config.supportedVersions.join(', '));
      res.set('X-API-Default-Version', this.config.defaultVersion);

      next();
    } catch (error) {
      logger.error('Version middleware error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: 'Version processing error',
        message: 'Failed to process API version'
      });
    }
  };

  /**
   * Middleware to check version compatibility
   */
  public compatibilityMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const version = (req as any).apiVersion;
      const versionInfo = this.getVersionInfo(version);

      if (!versionInfo) {
        return next();
      }

      // Check if version is sunset
      if (versionInfo.status === 'sunset') {
        const sunsetDate = versionInfo.sunsetDate;
        if (sunsetDate && new Date() > sunsetDate) {
          res.status(410).json({
            success: false,
            error: 'API version sunset',
            message: `API version ${version} has been sunset and is no longer available`,
            sunsetDate: sunsetDate.toISOString(),
            migrationGuide: versionInfo.migrationGuide
          });
          return;
        }
      }

      next();
    } catch (error) {
      logger.error('Compatibility middleware error', { error: (error as Error).message });
      next();
    }
  };

  /**
   * Get version information endpoint
   */
  public getVersionInfoEndpoint = (req: Request, res: Response): void => {
    try {
      const version = (req as any).apiVersion;
      const versionInfo = this.getVersionInfo(version);

      if (!versionInfo) {
        res.status(404).json({
          success: false,
          error: 'Version not found',
          message: `Version ${version} not found`
        });
        return;
      }

      res.json({
        success: true,
        data: {
          version: versionInfo.version,
          status: versionInfo.status,
          releaseDate: versionInfo.releaseDate.toISOString(),
          sunsetDate: versionInfo.sunsetDate?.toISOString(),
          description: versionInfo.description,
          changes: versionInfo.changes,
          breakingChanges: versionInfo.breakingChanges,
          migrationGuide: versionInfo.migrationGuide
        }
      });
    } catch (error) {
      logger.error('Version info endpoint error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: 'Version info error',
        message: 'Failed to get version information'
      });
    }
  };

  /**
   * Get all versions endpoint
   */
  public getAllVersionsEndpoint = (req: Request, res: Response): void => {
    try {
      const versions = Array.from(this.config.versions.values()).map(version => ({
        version: version.version,
        status: version.status,
        releaseDate: version.releaseDate.toISOString(),
        sunsetDate: version.sunsetDate?.toISOString(),
        description: version.description
      }));

      res.json({
        success: true,
        data: {
          versions,
          defaultVersion: this.config.defaultVersion,
          supportedVersions: this.config.supportedVersions,
          latestStable: this.getLatestStableVersion()
        }
      });
    } catch (error) {
      logger.error('All versions endpoint error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: 'Versions error',
        message: 'Failed to get versions information'
      });
    }
  };

  /**
   * Update version configuration
   */
  public updateConfig(newConfig: Partial<VersionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.validateConfig();
  }

  /**
   * Add new version
   */
  public addVersion(version: string, versionInfo: ApiVersion): void {
    this.config.versions.set(version, versionInfo);
    this.config.supportedVersions.push(version);
    this.validateConfig();
  }

  /**
   * Remove version
   */
  public removeVersion(version: string): void {
    this.config.versions.delete(version);
    this.config.supportedVersions = this.config.supportedVersions.filter(v => v !== version);
    this.validateConfig();
  }

  /**
   * Get configuration
   */
  public getConfig(): VersionConfig {
    return { ...this.config };
  }
}
