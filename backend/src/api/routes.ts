/**
 * API Routes Manager
 * Handles versioned API routing
 */

import { Router } from 'express';
import { versionManager, versionRoutes } from './versioning';
import { v1Routes } from './v1';
import { v2Routes } from './v2';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { userValidation as userSchemas } from '../validates/user.validate';
import { authSchemas } from '../validates/auth.validate';
import { UserModuleController } from '../modules/user';
import { AuthController } from '../modules/auth/auth.controller';

const router = Router();

// Fast-path explicit endpoints to ensure tests resolve even if nested mounts change
const userController = new UserModuleController();
const authController = new AuthController();
router.get('/users/profile', authMiddleware, (req, res, next) => userController.getProfile(req, res, next));
router.put('/users/profile', authMiddleware, validateBody(userSchemas.updateProfile), (req, res, next) => userController.updateProfile(req, res, next));
router.put('/users/change-password', authMiddleware, validateBody(authSchemas.changePassword), (req, res, next) => authController.changePassword(req, res, next));

// Temporary route debug to verify registered paths during tests
// Note: keep lightweight and non-sensitive; remove when routes stabilize
router.get('/__routes_debug', (req, res) => {
	try {
		// @ts-ignore accessing internal stack for debug only
		const stack = (router as any).stack || [];
		const routes = stack
			.map((layer: any) => {
				if (layer?.route) {
					const methods = Object.keys(layer.route.methods || {}).join(',').toUpperCase();
					return `${methods} ${layer.route.path}`;
				}
				if (layer?.name === 'router' && layer?.regexp) {
					// nested router, try to extract mount path from regex (best-effort)
					return `USE ${layer.regexp?.toString()}`;
				}
				return null;
			})
			.filter(Boolean);
		res.json({ routes });
	} catch (e) {
		res.json({ routes: [], error: (e as Error).message });
	}
});

// Mount version routes
router.use('/v1.0.0', v1Routes);
router.use('/v1.1.0', v1Routes);
router.use('/v1.2.0', v1Routes);
router.use('/v2.0.0', v2Routes);

// Backward-compatible alias for /v1 prefix used in some tests
router.use('/v1', v1Routes);

// Mount version information routes
router.use('/versions', versionManager.versionMiddleware, versionRoutes);

// Default route (latest stable version)
// Mount v1 routes at root as the fallback to ensure paths like /users/profile resolve correctly
// Note: explicit versioned mounts above still take precedence when used
router.use('/', v1Routes);

export default router;

