/**
 * PROFIT TOOL — Enterprise Billing Routes
 */
import { Router } from 'express';
import { billingController } from '../controllers/index.ts';

const router = Router();

router.get('/plans', (req, res) => billingController.listPlans(req, res));
router.post('/subscribe', (req, res) => billingController.subscribe(req, res));

export default router;
