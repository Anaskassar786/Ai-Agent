import { Request, Response } from 'express';
import { shopifyService } from '../services/shopify.service.ts';
import { shopifyApiService } from '../services/shopify.api.service.ts';
import { storeRepo } from '../repositories/index.ts';

export const shopifyController = {

  async install(req: Request, res: Response) {
    const shop = req.query.shop as string;

    if (!shop) {
      return res.status(400).send('Missing shop parameter');
    }

    const scopes =
      'read_orders,read_customers,read_products,read_inventory,write_products';

    const redirectUri =
      `${process.env.APP_URL}/api/shopify/callback`;

    const installUrl =
      `https://${shop}/admin/oauth/authorize` +
      `?client_id=${process.env.SHOPIFY_API_KEY}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;

    res.redirect(installUrl);
  },


  async callback(req: Request, res: Response) {
    try {
      const { shop, code } = req.query as {
        shop: string;
        code: string;
      };

      const store =
        await shopifyService.exchangeCodeForAccessToken(shop, code);

      await shopifyApiService.registerWebhooks(store);

      res.redirect(
        `/?shop=${shop}&installed=true&storeId=${store.id}`
      );

    } catch (error:any) {
      res.status(500).json({
        error: error.message
      });
    }
  },


  async registerWebhooks(req: Request, res: Response) {
    try {
      const { shop } = req.body;

      if (!shop) {
        return res.status(400).json({
          error: "shop required"
        });
      }

      const store =
        await storeRepo.getByDomain(shop);

      if (!store) {
        return res.status(404).json({
          error: "Store not found"
        });
      }

      await shopifyApiService.registerWebhooks(store);

      res.json({
        success: true,
        message: "Webhooks registered"
      });

    } catch (error:any) {
      res.status(500).json({
        error: error.message
      });
    }
  }

};
