'use strict';

const Connection = require('./connection');

class Client {
  constructor(config) {
    this.connection = new Connection(config);
  }

  async connect() {
    await this.connection.connect();
  }

  end() {
    this._ending = true;

    if (this.activeQuery) {
      this.connection.stream.destroy();
    } else {
      this.connection.end();
    }
  
    return new Promise((resolve, reject) => {
      this.connection.once('end', resolve);
    })
  }

  async query(sql) {
    // to do
  }
}

module.exports = Client