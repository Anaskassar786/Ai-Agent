/**
 * PROFIT TOOL — Auth Routes
 */
import { Router } from 'express';
import { authController } from '../controllers/index.ts';

const router = Router();

router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));
router.post('/switch-store', (req, res) => authController.switchStore(req, res));

export default router;
