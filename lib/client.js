'use strict';

const Connection = require('./connection');
const Utils = require('./utils');
const EventEmitter = require('events');
const _end = Symbol('end'); 

class Client extends EventEmitter {
  /**
   * Class private fields, need Node.js 12+
   * use symbol properties instead of, for use in lower version Node.js
   */
  // #end = false;

  /**
   * @constructor
   * @param {Object} config 
   */
  constructor(config) {
    super();
    /**
     * symbol properties
     * can't get by "for...in", "for...of", "Object.keys()", "Object.getOwnPrototypeNames()", "JSON.stringify()"
     * but is not private fields
     * can get by "Object.getOwnPropertySymbols"
     */
    this[_end] = false;
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
      // const error = new Error(this.#end ? 'Connection terminated' : 'Connection terminated unexpectedly');
      const error = new Error(this[_end] ? 'Connection terminated' : 'Connection terminated unexpectedly');
      
      if(!this[_end]) {   // if(!this.#end) { 
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
    // this.#end = true;
    this[_end] = true;

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