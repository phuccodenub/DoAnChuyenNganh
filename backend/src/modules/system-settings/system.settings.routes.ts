import { Router } from 'express';
import { SystemSettingsController } from './system.settings.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';

const router = Router();
const controller = new SystemSettingsController();

router.use(authMiddleware);
router.use(authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get('/', (req, res, next) => controller.getSettings(req, res, next));
router.put('/', (req, res, next) => controller.updateSettings(req, res, next));

export default router;
