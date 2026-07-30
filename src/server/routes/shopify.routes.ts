import { Router } from 'express';
import { shopifyApiService } from '../services/shopify.api.service.ts';
import { storeRepo } from '../repositories/index.ts';

const router = Router();

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

router.get('/orders', async (req, res) => {
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
