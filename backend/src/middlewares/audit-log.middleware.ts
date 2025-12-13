import { Request, Response, NextFunction } from 'express';
import { UserActivityLog } from '../models';
import logger from '../utils/logger.util';

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

function getActionFromMethod(method: string): 'create' | 'update' | 'delete' | null {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return null;
  }
}

function parseResourceType(originalUrl: string): { resourceType: string; resourceId: string | null } {
  const path = originalUrl.split('?')[0] || '';

  // Remove prefix '/api/'
  const withoutApi = path.startsWith('/api/') ? path.substring('/api/'.length) : path.replace(/^\/+/, '');
  const segments = withoutApi.split('/').filter(Boolean);

  // Drop version segment like v1.3.0
  if (segments.length > 0 && /^v\d/.test(segments[0] || '')) {
    segments.shift();
  }

  // Drop admin prefix
  if (segments[0] === 'admin') {
    segments.shift();
  }

  const resourceType = segments[0] || 'system';

  const match = path.match(UUID_RE);
  const resourceId = match ? match[0] : null;

  return { resourceType, resourceId };
}

export const auditLogMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const action = getActionFromMethod(req.method);
  const url = req.originalUrl || '';

  // Skip noisy endpoints
  if (!action) return next();
  if (url.includes('/admin/activity-logs')) return next();
  if (url.startsWith('/metrics') || url.startsWith('/health') || url.startsWith('/ping')) return next();

  res.on('finish', () => {
    try {
      // Only log authenticated actions
      const actorId = req.user?.userId;
      if (!actorId) return;

      const { resourceType, resourceId } = parseResourceType(url);
      const status = res.statusCode >= 400 ? 'failed' : 'success';

      // Avoid logging large bodies
      const body = req.body && typeof req.body === 'object' ? req.body : {};

      // Fire-and-forget
      void UserActivityLog.create({
        user_id: actorId,
        activity_type: action, // legacy required column
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        new_values: body,
        old_values: {},
        status,
        error_message: status === 'failed' ? `HTTP ${res.statusCode}` : null,
        ip_address: req.ip,
        user_agent: req.get('user-agent') || null,
        metadata: {
          method: req.method,
          path: url.split('?')[0],
          query: req.query,
          params: req.params,
        },
      }).catch((error: unknown) => {
        logger.warn('Failed to write audit log', { error });
      });
    } catch (error) {
      logger.warn('Audit log middleware error', { error });
    }
  });

  next();
};
