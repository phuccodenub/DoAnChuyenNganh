import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';
import { ActivityLogsAdminController } from './activity-logs.admin.controller';

const router = Router();
const controller = new ActivityLogsAdminController();

router.use(authMiddleware);
router.use(authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN]));

router.get('/', (req: Request, res: Response, next: NextFunction) => controller.list(req, res, next));
router.get('/export', (req: Request, res: Response, next: NextFunction) => controller.export(req, res, next));
router.post('/clear', (req: Request, res: Response, next: NextFunction) => controller.clearOld(req, res, next));
router.get('/:logId', (req: Request, res: Response, next: NextFunction) => controller.detail(req, res, next));

export default router;
