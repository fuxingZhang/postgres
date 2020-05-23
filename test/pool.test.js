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
  let client;

  before(async () => {
    client = await pool.connect();
  })

  after(async () => {
    try {
      await pool.end();
      await pool.query('SELECT * from users');
      assert(false);
    } catch (error) {
      assert(true);
    }
  });

  it('connect should ok', async () => {
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

  it('query should ok', async () => {
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