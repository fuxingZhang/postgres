'use strict';
const assert = require('assert');
const { Client, Pool } = require('../index');

describe('test/client.test.js', function () {
  it('query should ok', async () => {
    const client = new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'test',
      password: 'esri@123',
      port: 5432
    });

    await client.connect();

    try {
      const res = await client.query('SELECT * from users')
      assert(res);
      assert(res.command === 'SELECT');
      assert(typeof res.rowCount === 'number');
      assert(Array.isArray(res.rows));
      assert(Array.isArray(res.fields));
    } catch (error) {
      console.log(error);
      assert(false);
    } finally {
      await client.end();
    }
  });
});