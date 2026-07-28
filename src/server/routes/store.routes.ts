/**
 * PROFIT TOOL — Store & Configuration Routes
 */
import { Router } from 'express';
import { storeController } from '../controllers/index.ts';

const router = Router();

router.get('/', (req, res) => storeController.listStores(req, res));
router.get('/config', (req, res) => storeController.getConfig(req, res));
router.put('/config', (req, res) => storeController.updateConfig(req, res));

export default router;
