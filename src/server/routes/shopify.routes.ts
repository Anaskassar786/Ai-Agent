import { Router } from 'express';
import crypto from 'crypto';
import { shopifyApiService } from '../services/shopify.api.service.ts';
import { shopifyService } from '../services/shopify.service.ts';
import { storeRepo } from '../repositories/index.ts';

const router = Router();
router.get('/install', (req, res) => {
  const shop = req.query.shop as string;

  if (!shop) {
    return res.status(400).send('Missing shop parameter');
  }

  const scopes =
    'read_products,read_orders,read_customers,read_inventory,write_products';

    `${process.env.APP_URL}/api/shopify/callback`;const redirectUri =
    `${process.env.APP_URL}/api/shopify/callback`;
     const state = crypto.randomUUID();

  const installUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${process.env.SHOPIFY_API_KEY}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;
  + `&state=${state}`;

  res.redirect(installUrl);
});

router.get('/products', async (req, res) => {
  try {
    const store = await storeRepo.getByDomain(req.query.shop as string);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const data = await shopifyApiService.getProducts(store);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const store = await storeRepo.getByDomain(req.query.shop as string);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const data = await shopifyApiService.getCustomers(store);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

roter.get('/orders', async (req, res) => {
  try {
    const store = await storeRepo.getByDomain(req.query.shop as string);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const data = await shopifyApiService.getOrders(store);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/inventory', async (req, res) => {
  try {
    const store = await storeRepo.getByDomain(req.query.shop as string);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const data = await shopifyApiService.getInventory(store);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
