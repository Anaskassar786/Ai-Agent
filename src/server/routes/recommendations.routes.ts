/**
 * PROFIT TOOL — Recommendation Routes
 */
import { Router } from 'express';
import { recController } from '../controllers/index.ts';

const router = Router();

router.get('/', (req, res) => recController.listRecommendations(req, res));
router.get('/:id', (req, res) => recController.getById(req, res));
router.get('/:id/evidence', (req, res) => recController.getEvidenceHistory(req, res));
router.patch('/:id/status', (req, res) => recController.updateStatus(req, res));
router.post('/:id/feedback', (req, res) => recController.submitFeedback(req, res));

export default router;
