'use strict';
const assert = require('assert');
const fs = require('fs');
const { Client, Pool } = require('../index');

describe('test/ssl.test.js', function () {
  it('query should ok', async () => {
    const client = new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'postgres',
      password: 'esri@123',
      port: 5432,
      ssl: {
        rejectUnauthorized: false,
        // ca: fs.readFileSync('c:/my/server.crt').toString(),
        key: fs.readFileSync('c:/my/server.key').toString(),
        cert: fs.readFileSync('c:/my/server.crt').toString(),
      }
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
