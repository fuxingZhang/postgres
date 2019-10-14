'use strict';

const Connection = require('./connection');
const Utils = require('./utils');

class Client {
  /**
   * @constructor
   * @param {Object} config 
   */
  constructor(config) {
    this.user = config.user;
    this.host = config.host;
    this.database = config.database;
    this.password = config.password;
    this.port = config.port;
    this.ssl = config.ssl;
    this.connection = new Connection(config);
  }

  connect() {
    this.connection.connect();

    this.connection.on('AuthenticationMD5Password', message => {
      const md5Password = Utils.Md5Password(this.user, this.password, message.salt);
      this.connection.password(md5Password);
    });

    this.connection.on('AuthenticationCleartextPassword', message => {
      this.connection.password(this.password);
    });

    return new Promise((resolve, reject) => {
      this.connection.on('AuthenticationOk', message => {
        console.log('server response:', message.message)

        resolve(message.message);
      })

      this.connection.on('error', err => {
        console.log('connection error:', err)

        reject(err);
      })
    })
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