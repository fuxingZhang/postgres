# postgres
PostgreSQL client for node.js.  

## Install

```sh
$ npm i node-postgres
```

### Status
* [x] client
* [x] pool
* [x] ssl
* [x] end
* [x] transactions

## Useage  

### Client 

```js
const { Client } = require('node-postgres');

(async () => {
  const client = new Client({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'test',
    password: 'esri@123',
    port: 5432
  });
  
  await client.connect();

  const res = await client.query('SELECT * from users');
  console.log(res);
  await client.end();
})().catch(console.error);
```  

### ssl 
```js
const { Client, Pool } = require('node-postgres');
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
  
  const res = await client.query('SELECT * from users');
  console.log(res);
  await client.end();
})().catch(console.error);
```  

### Pool
The client pool allows you to have a reusable pool of clients you can check out, use, and return. You generally want a limited number of these in your application and usually just 1. Creating an unbounded number of pools defeats the purpose of pooling at all.

#### Checkout, use, and return
```js
const { Pool } = require('node-postgres');

(async () => {
  const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'test',
    password: 'esri@123',
    port: 5432
  });
  
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * from users');
    console.log(res);
  } catch (error) {
    console.log(error);
  } finally {
    client.release();
  }
})().catch(console.error);
```
You must always return the client to the pool if you successfully check it out, regardless of whether or not there was an error with the queries you ran on the client. If you don't check in the client your application will leak them and eventually your pool will be empty forever and all future requests to check out a client from the pool will wait forever.

#### Single query
If you don't need a transaction or you just need to run a single query, the pool has a convenience method to run a query on any available client in the pool. This is the preferred way to query with node-postgres if you can as it removes the risk of leaking a client.
```js
const { Pool } = require('node-postgres');

(async () => {
  const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'test',
    password: 'esri@123',
    port: 5432
  });
  
  const res = await pool.query('SELECT * from users');
  console.log(res);
})().catch(console.error);
```

### Shutdown
To shut down a pool call pool.end() on the pool. This will wait for all checked-out clients to be returned and then shut down all the clients and the pool timers.
```js
const { Pool } = require('node-postgres');

(async () => {
  const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'test',
    password: 'esri@123',
    port: 5432
  });
  
  const res = await pool.query('SELECT * from users');
  console.log(res);
  await pool.end()
  // will throw error
  await pool.query('SELECT * from users');
})().catch(console.error);
```
The pool will return errors when attempting to check out a client after you've called `pool.end()` on the pool.

## Test

```bash
$ npm test
```  