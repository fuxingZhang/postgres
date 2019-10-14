'use strict';

const Connection = require('./connection');
const Utils = require('./utils');
const EventEmitter = require('events');

class Client extends EventEmitter {
  /**
   * @constructor
   * @param {Object} config 
   */
  constructor(config) {
    super();
    this.user = config.user;
    this.host = config.host;
    this.database = config.database;
    this.password = config.password;
    this.port = config.port;
    this.ssl = config.ssl;
    this.connection = new Connection(config);
  }

  connect() {
    const con = this.connection;
    con.connect();

    con.on('AuthenticationMD5Password', message => {
      const md5Password = Utils.Md5Password(this.user, this.password, message.salt);
      con.password(md5Password);
    });

    con.on('AuthenticationCleartextPassword', () => {
      con.password(this.password);
    });

    con.once('end', () => {
      const error = new Error(this.#end ? 'Connection terminated' : 'Connection terminated unexpectedly');
      
      if(!this.#end) {
        console.log(error);
        // to do
      }

      process.nextTick(() => {
        this.emit('end');
      });
    });

    return new Promise((resolve, reject) => {
      con.on('AuthenticationOk', message => {
        console.log('server response:', message.message)

        resolve(message.message);
      })

      con.on('error', err => {
        console.log('connection error:', err)

        reject(err);
      })
    })
  }

  end() {
    this.#end = true;

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