'use strict';
const assert = require('assert');
const { Pool } = require('../index');

describe('test/transation.test.js', function () {
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
    const { rowCount, rows } = await client.query(`INSERT INTO users(id, name) VALUES(1, 'zfx') RETURNING id`);
    assert(rowCount === 1)
    assert(rows.length === 1)
    assert(rows[0].id === 1)
  })

  after(async () => {
    const res = await client.query('DELETE FROM users WHERE id in(1, 2)');
    assert(res.rowCount === 2);
    await pool.end();
  });

  it('rollback should ok', async () => {
    try {
      await client.query('BEGIN');
      const del = await client.query('DELETE FROM users WHERE id=1');
      assert(del.command === 'DELETE');
      assert(del.rowCount === 1);
      const { rows } = await client.query('SELECT * FROM users');
      assert(rows.length === 0);
      await client.query('ROLLBACK');
      const res = await client.query('SELECT * FROM users');
      assert(res.rows.length === 1);
      assert(res.rows[0].id === 1);
      assert(res.rows[0].name === 'zfx');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  });

  it('commit should ok', async () => {
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(`INSERT INTO users(id, name) VALUES(2, 'zfx2') RETURNING id`);
      assert(rows.length === 1);
      assert(rows[0].id === 2);
      await client.query('COMMIT');
      const res = await client.query('SELECT * FROM users');
      assert(res.rows.length === 2);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  });
});