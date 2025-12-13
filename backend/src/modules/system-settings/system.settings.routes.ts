import { Router, Request, Response, NextFunction } from 'express';
import { SystemSettingsController } from './system.settings.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';

const router = Router();
const controller = new SystemSettingsController();

router.use(authMiddleware);
router.use(authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN]));

router.get('/', (req: Request, res: Response, next: NextFunction) => controller.getSettings(req, res, next));
router.put('/', (req: Request, res: Response, next: NextFunction) => controller.updateSettings(req, res, next));
router.post('/test-email', (req: Request, res: Response, next: NextFunction) => controller.testEmailConnection(req, res, next));

export default router;
