require('dotenv').config();
const { Client } = require('pg');

const c = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await c.connect();

  await c.query(`
    INSERT INTO stores (
      id,
      shopify_domain,
      store_name,
      owner_email,
      owner_name,
      currency,
      installed_at,
      is_active,
      access_token,
      active_plan
    )
    VALUES (
      'store_test',
      'test.myshopify.com',
      'Test Store',
      'test@test.com',
      'Test Owner',
      'USD',
      NOW(),
      true,
      'token',
      'Starter'
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  const r = await c.query('SELECT id,store_name FROM stores');
  console.log(r.rows);

  await c.end();
}

run().catch(console.error);
