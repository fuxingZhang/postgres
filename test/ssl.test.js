'use strict';
const { Client, Pool } = require('../index');
const fs = require('fs');

(async () => {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
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
  
  const res = await client.query('SELECT * from users')
  console.log(res);
  await client.end();
})().catch(console.error);
