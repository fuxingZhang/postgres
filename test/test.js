'use strict';

const { Client, Pool } = require('../index');

(async () => {
  const client = new Client({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'test',
    password: 'esri@123',
    port: 5432,
    ssl: false
  });
  
  await client.connect();
  console.log('connected');
  
  const res = await client.query('SELECT * from users')
  console.log(res);
  await client.end();
})().catch(console.error);
