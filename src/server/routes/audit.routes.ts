/**
 * PROFIT TOOL — Audit Trail Routes
 */
import { Router } from 'express';
import { auditController } from '../controllers/index.ts';

const router = Router();

router.get('/', (req, res) => auditController.getAuditLogs(req, res));

export default router;
