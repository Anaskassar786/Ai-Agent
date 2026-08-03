/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Full-Stack Express Server & API Router
 * Runs on port 3000 (0.0.0.0 ingress) with Vite middleware
 */

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { createServer as createViteServer } from 'vite';
import {
  authController,
  storeController,
  recController,
  ruleController,
  analyticsController,
  auditController,
  notifController,
  billingController,
  shopifyController
} from './src/server/controllers/index.ts';
import { authService } from './src/server/services/auth.service.ts';
import { shopifySyncService } from './src/server/services/shopify.sync.service.ts';
import { POSTGRESQL_DDL_SCHEMA } from './src/server/db/schema.ts';
import { ErrorMiddleware } from './src/server/middleware/index.ts';
import apiRouter from './src/server/routes/index.ts';
import { EnterpriseLogger } from './src/server/utils/index.ts';
import { AuthMiddleware } from './src/server/middleware/auth.middleware.ts';

const PORT = 3000;

// Authentication Middleware
async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Bearer token required'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await authService.verifyToken(token);

    (req as any).user = decoded;

    return next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
}

async function startServer() {
  const app = express();

  // Support raw body for HMAC SHA256 verification in Shopify webhooks
  app.use(express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: true }));
app.use(ErrorMiddleware.requestLogger);

// Mount modular v2 routers
app.use('/api/v2', apiRouter);

  // Mount modular v2 routers (Document 13B Enterprise Structure)

  // ==========================================
  // API ROUTE DEFINITIONS
  // ==========================================
  
  // Health & System Information
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'production-ready',
      version: '1.0.0',
      database: 'PostgreSQL Enterprise / Embedded Simulator Engine Active',
      aiEngine: 'Google Gemini (@google/genai) Decision Support Active',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/schema', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(POSTGRESQL_DDL_SCHEMA);
  });

  app.get(['/openapi.json', '/api/openapi.json'], (req, res) => {
    res.sendFile(path.join(process.cwd(), 'openapi.json'));
  });

  // Explicit server.ts text download (preventing OS/browser video/mp2t MPEG Transport Stream misinterpretation)
  app.get(['/server.ts', '/api/export/server.ts', '/api/source/server.ts'], (req, res) => {
    const filePath = path.join(process.cwd(), 'server.ts');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="server.ts"');
    res.sendFile(filePath);
  });

  // Explicit .env.example text download
  app.get(['/.env.example', '/api/export/.env.example', '/api/source/.env.example'], (req, res) => {
    const filePath = path.join(process.cwd(), '.env.example');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=".env.example"');
    res.sendFile(filePath, { dotfiles: 'allow' });
  });

  // Explicit 0001_initial_schema.sql text download
  app.get(['/0001_initial_schema.sql', '/migrations/0001_initial_schema.sql', '/api/export/0001_initial_schema.sql', '/api/source/0001_initial_schema.sql'], (req, res) => {
    const filePath = path.join(process.cwd(), '0001_initial_schema.sql');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="0001_initial_schema.sql"');
    res.sendFile(filePath);
  });

  // Explicit download routes for the five requested core files
  app.get(['/src/server/controllers/index.ts', '/api/source/src/server/controllers/index.ts', '/controllers/index.ts'], (req, res) => {
    const filePath = path.join(process.cwd(), 'src', 'server', 'controllers', 'index.ts');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="index.ts"');
    res.sendFile(filePath);
  });

  app.get(['/src/server/services/auth.service.ts', '/api/source/src/server/services/auth.service.ts', '/auth.service.ts'], (req, res) => {
    const filePath = path.join(process.cwd(), 'src', 'server', 'services', 'auth.service.ts');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="auth.service.ts"');
    res.sendFile(filePath);
  });

  app.get(['/src/server/services/shopify.service.ts', '/api/source/src/server/services/shopify.service.ts', '/shopify.service.ts'], (req, res) => {
    const filePath = path.join(process.cwd(), 'src', 'server', 'services', 'shopify.service.ts');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="shopify.service.ts"');
    res.sendFile(filePath);
  });

  app.get(['/src/server/services/ai.service.ts', '/api/source/src/server/services/ai.service.ts', '/ai.service.ts'], (req, res) => {
    const filePath = path.join(process.cwd(), 'src', 'server', 'services', 'ai.service.ts');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="ai.service.ts"');
    res.sendFile(filePath);
  });

  app.get(['/tests/profit-tool.test.ts', '/api/source/tests/profit-tool.test.ts', '/profit-tool.test.ts'], (req, res) => {
    const filePath = path.join(process.cwd(), 'tests', 'profit-tool.test.ts');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="profit-tool.test.ts"');
    res.sendFile(filePath);
  });

  app.get(['/package.json', '/api/source/package.json'], (req, res) => {
    const filePath = path.join(process.cwd(), 'package.json');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="package.json"');
    res.sendFile(filePath);
  });

  app.get(['/drizzle.config.ts', '/api/source/drizzle.config.ts'], (req, res) => {
    const filePath = path.join(process.cwd(), 'drizzle.config.ts');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="drizzle.config.ts"');
    res.sendFile(filePath);
  });

  app.get(['/src/types.ts', '/api/source/src/types.ts', '/types/index.ts', '/types.ts'], (req, res) => {
    const filePath = path.join(process.cwd(), 'src', 'types.ts');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="types.ts"');
    res.sendFile(filePath);
  });

  app.get(['/src/server/db/index.ts', '/api/source/src/server/db/index.ts', '/db.ts', '/src/server/db/schema.ts', '/api/source/src/server/db/schema.ts', '/schema.ts'], (req, res) => {
    const isSchema = req.path.includes('schema');
    const filePath = path.join(process.cwd(), 'src', 'server', 'db', isSchema ? 'schema.ts' : 'index.ts');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${isSchema ? 'schema.ts' : 'db.ts'}"`);
    res.sendFile(filePath);
  });

  // Generic source file viewer/downloader as plain text (supports nested directories via regex)
  app.get(/^\/api\/source\/(.+)$/, (req, res) => {
    const filename = req.params[0] || req.params.filename;
    // prevent path traversal
    const sanitized = path.normalize(String(filename)).replace(/^(\.\.(\/|\\|$))+/, '');
    const filePath = path.join(process.cwd(), sanitized);
    const baseName = path.basename(sanitized);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}"`);
    res.sendFile(filePath, { dotfiles: 'allow' }, (err) => {
      if (err) {
        res.status(404).json({ error: 'File not found', file: sanitized });
      }
    });
  });

  app.get(['/profit-tool-enterprise-source.zip', '/api/download-zip', '/api/export/zip'], (req, res) => {
    try {
      const zipPath = path.join(process.cwd(), 'profit-tool-enterprise-source.zip');
      const tmpZipPath = path.join('/tmp', 'profit-tool-enterprise-source.zip');
      try {
        const pyCmd = `python3 -c "import os, zipfile
with zipfile.ZipFile('/tmp/profit-tool-enterprise-source.zip', 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', '.git', '.cache', '.aistudio', '.DS_Store']]
        for file in files:
            if file.endswith('.zip'): continue
            filepath = os.path.join(root, file)
            arcname = os.path.relpath(filepath, '.')
            try: zf.write(filepath, arcname)
            except Exception: pass"`;
        execSync(pyCmd, { cwd: process.cwd(), stdio: 'ignore' });
        if (fs.existsSync(tmpZipPath)) {
          fs.copyFileSync(tmpZipPath, zipPath);
        }
      } catch (e) {
        // Fallback to existing archive if python creation fails
      }

      if (!fs.existsSync(zipPath)) {
        return res.status(404).json({ error: 'Archive not found on server' });
      }

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="profit-tool-enterprise-source.zip"');
      res.sendFile(zipPath, (err) => {
        if (err && !res.headersSent) {
          res.status(500).json({ error: 'Failed to send zip file', details: String(err) });
        }
      });
    } catch (err) {
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to export zip file', details: String(err) });
      }
    }
  });

  // Auth Routes
  app.post('/api/auth/login', (req, res) => authController.login(req, res));
  app.post('/api/auth/refresh', (req, res) => authController.refresh(req, res));
  app.post(
  '/api/auth/switch-store',
  requireAuth,
  AuthMiddleware.requireRole(['OWNER']),
  (req, res) => authController.switchStore(req, res)
);

  // Stores & Configuration
  app.get('/api/stores', requireAuth, (req, res) => storeController.listStores(req, res));
  app.get('/api/stores/config', requireAuth, (req, res) => storeController.getConfig(req, res));
  app.put(
  '/api/stores/config',
  requireAuth,
  AuthMiddleware.requireRole(['OWNER']),
  (req, res) => storeController.updateConfig(req, res)
);

  // Recommendations & Explainability
  app.get('/api/recommendations', requireAuth, (req, res) => recController.listRecommendations(req, res));
  app.get('/api/recommendations/:id', requireAuth, (req, res) => recController.getById(req, res));
  app.get('/api/recommendations/:id/evidence', requireAuth, (req, res) => recController.getEvidenceHistory(req, res));
  app.patch('/api/recommendations/:id/status', requireAuth, (req, res) => recController.updateStatus(req, res));
  app.post('/api/recommendations/:id/feedback', requireAuth, (req, res) => recController.submitFeedback(req, res));

  // Rule Engine
  app.get('/api/rules', requireAuth, (req, res) => ruleController.listRules(req, res));
  app.post(
  '/api/rules',
  requireAuth,
  AuthMiddleware.requireRole(['OWNER']),
  (req, res) => ruleController.createCustomRule(req, res)
);
  app.patch('/api/rules/:id/toggle', requireAuth, (req, res) => ruleController.toggleRule(req, res));
  app.post('/api/rules/simulate', requireAuth, (req, res) => ruleController.simulateCart(req, res));

  // Analytics & Cart Intelligence
  app.get('/api/analytics/metrics', requireAuth, (req, res) => analyticsController.getMetrics(req, res));
  app.get('/api/analytics/carts-customers', requireAuth, (req, res) => analyticsController.listCartsAndCustomers(req, res));

  // Audit Logs & Notifications
  app.get('/api/audit-logs', requireAuth, (req, res) => auditController.getAuditLogs(req, res));
  app.get('/api/notifications', requireAuth, (req, res) => notifController.listNotifications(req, res));
  app.patch('/api/notifications/:id/read', requireAuth, (req, res) => notifController.markAsRead(req, res));
  app.post('/api/notifications/mark-all-read', requireAuth, (req, res) => notifController.markAllAsRead(req, res));

  // Billing API
  app.get('/api/billing/plans', requireAuth, (req, res) => billingController.listPlans(req, res));
  app.post(
  '/api/billing/subscribe',
  requireAuth,
  AuthMiddleware.requireRole(['OWNER']),
  (req, res) => billingController.subscribe(req, res)
);

  // Shopify Official Integration Endpoints
  app.get('/api/shopify/install', (req, res) => shopifyController.install(req, res));
  app.get('/api/shopify/callback', (req, res) => shopifyController.callback(req, res));
  app.post('/api/webhooks/shopify/*all', (req, res) => shopifyController.handleWebhook(req, res));
  app.post('/api/test/trigger-abandoned-cart', requireAuth, (req, res) => shopifyController.triggerTestCart(req, res));
  app.post('/api/shopify/register-webhooks', (req, res) => shopifyController.registerWebhooks(req, res));

  // ==========================================
  // VITE MIDDLEWARE & STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Enterprise Global Exception Handler (Document 13B)
  app.use(ErrorMiddleware.errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PROFIT TOOL Enterprise Server running on http://0.0.0.0:${PORT}`);
    console.log(`🤖 AI Engine: Google Gemini (@google/genai) Active`);
    console.log(`🗄️ Database Engine: pre-seeded with 3 live Shopify merchant accounts`);
  });
}

startServer();
