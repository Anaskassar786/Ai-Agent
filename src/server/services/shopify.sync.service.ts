import { shopifyApiService } from './shopify.api.service.ts';
import {
  productRepo,
  orderRepo,
  customerRepo,
  inventoryRepo,
  storeRepo
} from '../repositories/index.ts';


export class ShopifySyncService {

  async syncStore(shop: string) {

    const store = await storeRepo.getByDomain(shop);

    if (!store) {
      throw new Error('Store not found');
    }


    // PRODUCTS
    const products =
      await shopifyApiService.getProducts(store);

    for (const edge of products.data.products.edges) {
      await productRepo.save({
        storeId: store.id,
        shopifyId: edge.node.id,
        title: edge.node.title,
        status: edge.node.status,
        inventory: edge.node.totalInventory
      });
    }


    // CUSTOMERS
    const customers =
      await shopifyApiService.getCustomers(store);

    for (const edge of customers.data.customers.edges) {
      await customerRepo.save({
        storeId: store.id,
        shopifyCustomerId: edge.node.id,
        email: edge.node.email,
        firstName: edge.node.firstName || '',
        lastName: edge.node.lastName || '',
        totalOrders: Number(edge.node.numberOfOrders),
        totalSpent: Number(edge.node.amountSpent.amount),
        isVIP: false,
        tags: []
      });
    }


    // ORDERS
    const orders =
      await shopifyApiService.getOrders(store);

    console.log("ORDERS DEBUG:");
    console.dir(orders, { depth: null });

    for (const edge of orders.data.orders.edges) {
      await orderRepo.save({
        storeId: store.id,
        shopifyOrderId: edge.node.id,
        totalPrice: edge.node.totalPriceSet?.shopMoney?.amount
      });
    }


    // INVENTORY
    const inventory =
      await shopifyApiService.getInventory(store);

    for (const edge of inventory.data.productVariants.edges) {
      await inventoryRepo.save({
        storeId: store.id,
        variantId: edge.node.id,
        productTitle: edge.node.product.title,
        quantity: edge.node.inventoryQuantity
      });
    }


    return {
      products: products.data.products.edges.length,
      customers: customers.data.customers.edges.length,
      orders: orders.data.orders.edges.length,
      inventory: inventory.data.productVariants.edges.length
    };
  }
}


export const shopifySyncService =
  new ShopifySyncService();
