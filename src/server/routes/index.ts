/**
 * PROFIT TOOL — Master API Router
 * Combines modular route definitions for enterprise scalability (Document 13B).
 */
import { Router } from 'express';
import authRoutes from './auth.routes.ts';
import shopifyRoutes from './shopify.routes.ts';
import storeRoutes from './store.routes.ts';
import recRoutes from './recommendations.routes.ts';
import ruleRoutes from './rules.routes.ts';
import analyticsRoutes from './analytics.routes.ts';
import auditRoutes from './audit.routes.ts';
import notifRoutes from './notifications.routes.ts';
import billingRoutes from './billing.routes.ts';
import webhookRoutes from './webhooks.routes.ts';
import { AuthMiddleware } from '../middleware/auth.middleware.ts';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/shopify/sync', (req, res, next) => {
  next();
});
apiRouter.use('/shopify', shopifyRoutes);
apiRouter.use('/webhooks', webhookRoutes);
apiRouter.use(AuthMiddleware.verifyToken);

apiRouter.use('/stores', storeRoutes);
apiRouter.use('/recommendations', recRoutes);
apiRouter.use('/rules', ruleRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/audit-logs', auditRoutes);
apiRouter.use('/notifications', notifRoutes);
apiRouter.use('/billing', billingRoutes);

export default apiRouter;
export {
  authRoutes,
  storeRoutes,
  shopifyRoutes,
  recRoutes,
  ruleRoutes,
  analyticsRoutes,
  auditRoutes,
  notifRoutes,
  billingRoutes,
  webhookRoutes
};
