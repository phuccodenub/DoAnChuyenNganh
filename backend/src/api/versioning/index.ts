/**
 * API Versioning Module
 * Centralized exports for API versioning components
 */

export { VersionManager } from './version.manager';
export type { ApiVersion, VersionConfig } from './version.manager';
export { versionManager, VERSION_INFO, API_VERSIONS, VERSION_STATUS } from './version.config';
export { default as versionRoutes } from './version.routes';

