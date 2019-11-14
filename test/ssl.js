'use strict';

const { Client, Pool } = require('../index');
const fs = require('fs');

(async () => {
  const client = new Client({
    // user: 'postgres',
    host: '127.0.0.1',
    database: 'postgres',
    // password: 'esri@123',
    // port: 54321,
    ssl: {
      rejectUnauthorized: false,
      ca: fs.readFileSync('./root.crt').toString(),
      key: fs.readFileSync('./postgresql.key').toString(),
      cert: fs.readFileSync('./postgresql.crt').toString(),
    }
  });
  
  await client.connect();
  console.log('connected');
  
  const res = await client.query('SELECT * from users')
  console.log(res);
  // await client.end();
})().catch(console.error);
