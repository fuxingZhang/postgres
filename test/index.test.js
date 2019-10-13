const Pg = require('../lib/index');

const pg = new Pg({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'test',
  password: 'esri@123',
  port: 5432,
  ssl: false
});