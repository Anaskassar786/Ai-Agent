/**
 * PROFIT TOOL — Rule Engine Studio Routes
 */
import { Router } from 'express';
import { ruleController } from '../controllers/index.ts';

const router = Router();

router.get('/', (req, res) => ruleController.listRules(req, res));
router.post('/', (req, res) => ruleController.createCustomRule(req, res));
router.patch('/:id/toggle', (req, res) => ruleController.toggleRule(req, res));
router.post('/simulate', (req, res) => ruleController.simulateCart(req, res));

export default router;
