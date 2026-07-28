/**
 * PROFIT TOOL — Notification Alert Routes
 */
import { Router } from 'express';
import { notifController } from '../controllers/index.ts';

const router = Router();

router.get('/', (req, res) => notifController.listNotifications(req, res));
router.patch('/:id/read', (req, res) => notifController.markAsRead(req, res));
router.post('/mark-all-read', (req, res) => notifController.markAllAsRead(req, res));

export default router;
