/**
 * PROFIT TOOL — Shopify Admin API Service
 * Real Shopify data access layer
 */

import axios from 'axios';
import { Store } from '../../types.ts';

const SHOPIFY_API_VERSION = '2026-04';

export class ShopifyApiService {

  private getUrl(store: Store) {
    return `https://${store.shopifyDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
  }

  async graphql(store: Store, query: string, variables = {}) {
    if (!store.accessToken) {
      throw new Error('Shopify access token missing');
    }

    try {
      const response = await axios.post(
        this.getUrl(store),
        {
          query,
          variables
        },
        {
          headers: {
            'X-Shopify-Access-Token': store.accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("SHOPIFY GRAPHQL RESPONSE");
      console.dir(response.data, { depth: null });

      return response.data;

    } catch (error: any) {
      console.error("SHOPIFY GRAPHQL ERROR");

      if (error.response) {
        console.error("STATUS:", error.response.status);
        console.error("DATA:", error.response.data);
      } else {
        console.error(error.message);
      }
console.error(
  "FULL SHOPIFY ERROR:",
  JSON.stringify(error.response?.data || error.message, null, 2)
);
      throw error;
    }
  }
       
  async getProducts(store: Store) {
    const query = `
      query {
        products(first: 10) {
          edges {
            node {
              id
              title
              status
              totalInventory
            }
          }
        }
      }
    `;

    return this.graphql(store, query);
  }
     async getCustomers(store: Store) {
    const query = `
      query {
        customers(first: 10) {
          edges {
            node {
              id
              firstName
              lastName
              email
              numberOfOrders
              amountSpent {
                amount
                currencyCode
              }
            }
          }
        }
      }
    `;

        return this.graphql(store, query);
  }

  async getOrders(store: Store) {
    const query = `
      query {
        orders(first: 10, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
      
          displayFinancialStatus
          displayFulfillmentStatus

               totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                firstName
                lastName
                email
              }
            }
          }
        }
      }
    `;

    return this.graphql(store, query);
  }

  async getInventory(store: Store) {
    const query = `
      query {
        productVariants(first: 10) {
          edges {
            node {
              id
              title
              inventoryQuantity
              product {
                title
              }
            }
          }
        }
      }
    `;

    return this.graphql(store, query);
  }
  async registerWebhooks(store: Store) {

    const mutation = `
    mutation webhookCreate($topic: WebhookSubscriptionTopic!, $callbackUrl: URL!) {
      webhookSubscriptionCreate(
        topic: $topic,
        webhookSubscription: {
          callbackUrl: $callbackUrl,
          format: JSON
        }
      ) {
        webhookSubscription {
          id
          topic
          callbackUrl
        }
        userErrors {
          field
          message
        }
      }
    }
    `;

    const topics = [
      "CARTS_UPDATE",
      "CHECKOUTS_CREATE",
      "CHECKOUTS_UPDATE",
      "ORDERS_CREATE",
      "ORDERS_PAID",
      "CUSTOMERS_CREATE",
      "CUSTOMERS_UPDATE",
      "APP_UNINSTALLED"
    ];

    for (const topic of topics) {
      const result = await this.graphql(
        store,
        mutation,
        {
          topic,
          callbackUrl: `${process.env.APP_URL}/api/webhooks/shopify/${topic.toLowerCase()}`
        }
      );

      console.log("Webhook result:", topic, result);
    }

    return true;
  }
}

export const shopifyApiService = new ShopifyApiService();
