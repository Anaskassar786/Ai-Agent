import { pool } from './client.ts';

async function test() {
  const result = await pool.query('SELECT NOW()');
  console.log(result.rows);
  await pool.end();
}

test().catch(console.error);
