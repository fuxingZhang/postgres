'use strict';

const EventEmitter = require('events');
const Client = require('./client');

class Pool extends EventEmitter {
  #idle = [];
  #clients = [];
  #end = false;
  #queue = [];

  constructor(options = {}) {
    super();
    this.idleTimeoutMillis = options.idleTimeoutMillis || 10000;
    this.max = options.max || 10;
    this.waitForConnections = options.waitForConnections || true;
    this.waitForConnectionsMillis = options.waitForConnectionsMillis || 0;
    this.queueLimit = options.queueLimit || 0;
    this.clientOptions = {
      user: options.user,
      host: options.host,
      database: options.database,
      password: options.password,
      port: options.port,
      ssl: options.ssl,
      connectionTimeoutMillis: options.connectionTimeoutMillis || 10000,
    };
  }

  async connect() {
    if (this.#end) {
      const err = new Error('Cannot use a pool after calling end on the pool');
      return Promise.reject(err);
    }
    if (this.#idle.length > 0) {
      const client = this.#idle.pop();
      if (client.timeoutId) clearTimeout(client.timeoutId);
      return client;
    }
    if (this.#clients >= this.max) {
      if (!this.waitForConnections) {
        const err = new Error('No connections available.');
        return Promise.reject(err);
      }
      if (this.queueLimit && this.#queue.length >= this.queueLimit) {
        const err = new Error('Queue limit reached.');
        return Promise.reject(err);
      }
      const queue = new EventEmitter();
      this.#queue.push(queue);
      return new Promise((resolve, reject) => {
        let timeoutId;
        if (waitForConnectionsMillis) {
          timeoutId = setTimeout(() => {
            this.#queue = this.#queue.filter(c => c !== queue);
            const err = new Error('wait for connection timeout');
            reject(err);
          }, this.waitForConnectionsMillis);
        }
        queue.once('release', client => {
          if (timeoutId) clearTimeout(timeoutId);
          resolve(client);
        });
        queue.once('err', err => {
          if (timeoutId) clearTimeout(timeoutId);
          reject(err);
        });
      });
    }
    const client = new Client(this.clientOptions);
    await client.connect();
    client.release = () => {
      if (this.#queue.length > 0) {
        const queue = this.#queue.shift();
        queue.emit('release', client);
      } else {
        if (this.idleTimeoutMillis) {
          client.timeoutId = setTimeout(() => {
            this.#idle = this.#idle.filter(c => c !== client);
            this.#clients = this.#clients.filter(c => c !== client);
          }, this.idleTimeoutMillis);
        }
        this.#idle.push(client);
      }
    }
    this.#clients.push(client);
    return client;
  }

  async query(sql) {
    const client = await this.connect();
    const result = await client.query(sql);
    client.release();
    return result;
  }

  async end() {
    this.#end = true;
    const err = new Error('Pool is closed.');
    err.code = 'POOL_CLOSED';
    for (const queue of this.#queue) {
      queue.emit('err', err);
    }
    await Promise.all(this.#clients.map(client => client.end()));
    this.#idle.length = 0;
    this.#clients.length = 0;
    this.#queue.length = 0;
  }
}

module.exports = Pool