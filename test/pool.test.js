'use strict';
const assert = require('assert');
const { Pool } = require('../index');

describe('test/pool.test.js', function () {
  const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'postgres',
    password: 'esri@123',
    port: 5432
  });

  after(async () => {
    try {
      await pool.end();
      await pool.query('SELECT * from users');
      assert(false);
    } catch (error) {
      assert(true);
    }
  });

  it('checkout client should ok', async () => {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * from users');
      assert(res);
      assert(res.command === 'SELECT');
      assert(typeof res.rowCount === 'number');
      assert(Array.isArray(res.rows));
      assert(Array.isArray(res.fields));
    } catch (error) {
      console.log(error);
      assert(false);
    } finally {
      client.release();
    }
  });

  it('pool.query should ok', async () => {
    try {
      const res = await pool.query('SELECT * from users');
      assert(res);
      assert(res.command === 'SELECT');
      assert(typeof res.rowCount === 'number');
      assert(Array.isArray(res.rows));
      assert(Array.isArray(res.fields));
    } catch (error) {
      console.log(error);
      assert(false);
    }
  });
});