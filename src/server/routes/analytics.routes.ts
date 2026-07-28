/**
 * PROFIT TOOL — Analytics Dashboard Routes
 */
import { Router } from 'express';
import { analyticsController } from '../controllers/index.ts';

const router = Router();

router.get('/metrics', (req, res) => analyticsController.getMetrics(req, res));
router.get('/carts-customers', (req, res) => analyticsController.listCartsAndCustomers(req, res));

export default router;
