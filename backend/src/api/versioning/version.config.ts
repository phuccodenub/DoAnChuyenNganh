/**
 * API Version Configuration
 * Defines all API versions and their metadata
 */

import { VersionManager, ApiVersion } from './version.manager';
import env from '../../config/env.config';

// Define API versions
const versions = new Map<string, ApiVersion>([
  ['v1.0.0', {
    version: 'v1.0.0',
    status: 'stable',
    releaseDate: new Date('2024-01-01'),
    description: 'Initial API version with basic functionality',
    changes: [
      'Initial release',
      'User management',
      'Authentication',
      'Course management',
      'Enrollment system'
    ],
    breakingChanges: [],
    migrationGuide: undefined
  }],
  ['v1.1.0', {
    version: 'v1.1.0',
    status: 'stable',
    releaseDate: new Date('2024-02-01'),
    description: 'Enhanced user management and course features',
    changes: [
      'Added user profile management',
      'Enhanced course search',
      'Improved authentication',
      'Added file upload support',
      'Enhanced error handling'
    ],
    breakingChanges: [],
    migrationGuide: undefined
  }],
  ['v1.2.0', {
    version: 'v1.2.0',
    status: 'stable',
    releaseDate: new Date('2024-03-01'),
    description: 'Advanced features and performance improvements',
    changes: [
      'Added caching support',
      'Enhanced monitoring',
      'Improved database performance',
      'Added API versioning',
      'Enhanced security features'
    ],
    breakingChanges: [],
    migrationGuide: undefined
  }],
  ['v2.0.0', {
    version: 'v2.0.0',
    status: 'beta',
    releaseDate: new Date('2024-04-01'),
    description: 'Major API redesign with breaking changes',
    changes: [
      'Redesigned API structure',
      'Enhanced error responses',
      'Improved validation',
      'Added new endpoints',
      'Enhanced documentation'
    ],
    breakingChanges: [
      'Changed response format',
      'Updated error codes',
      'Modified authentication flow',
      'Changed parameter names'
    ],
    migrationGuide: 'https://docs.example.com/migration/v2'
  }],
  ['v1.0.0-beta', {
    version: 'v1.0.0-beta',
    status: 'deprecated',
    releaseDate: new Date('2023-12-01'),
    sunsetDate: new Date('2024-06-01'),
    description: 'Beta version of v1.0.0 - deprecated',
    changes: [
      'Beta features',
      'Experimental endpoints',
      'Testing functionality'
    ],
    breakingChanges: [],
    migrationGuide: 'https://docs.example.com/migration/v1-beta'
  }]
]);

// Ensure default/supported versions from ENV exist in the map (add minimal metadata if missing)
const ensureVersion = (v: string) => {
  if (!versions.has(v)) {
    versions.set(v, {
      version: v,
      status: 'stable',
      releaseDate: new Date(),
      description: `Auto-registered version ${v} from environment`,
      changes: [],
      breakingChanges: [],
      migrationGuide: undefined
    });
  }
};

ensureVersion(env.api.defaultVersion);
env.api.supportedVersions.forEach(ensureVersion);

// Guarantee default version is included in supported versions
const supportedVersionsFinal = Array.from(new Set([
  ...env.api.supportedVersions,
  env.api.defaultVersion
]));

// Create version manager instance (driven by ENV)
export const versionManager = new VersionManager({
  defaultVersion: env.api.defaultVersion,
  supportedVersions: supportedVersionsFinal,
  versions,
  deprecationWarningDays: 30,
  sunsetWarningDays: 7
});

// Export version information
export const VERSION_INFO = {
  CURRENT: env.api.defaultVersion,
  LATEST: env.api.defaultVersion,
  BETA: 'v2.0.0',
  DEPRECATED: ['v1.0.0-beta'],
  SUNSET: []
};

// Export version constants
export const API_VERSIONS = {
  V1_0_0: 'v1.0.0',
  V1_1_0: 'v1.1.0',
  V1_2_0: 'v1.2.0',
  V1_3_0: 'v1.3.0',
  V2_0_0: 'v2.0.0',
  V1_0_0_BETA: 'v1.0.0-beta'
} as const;

// Export version status constants
export const VERSION_STATUS = {
  STABLE: 'stable',
  BETA: 'beta',
  DEPRECATED: 'deprecated',
  SUNSET: 'sunset'
} as const;

