'use strict';

const Connection = require('./connection');
const Query = require('./query');
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
    this.processID = void 0;
    this.secretKey = void 0;
  }

  connect() {
    const con = this.connection;
    con.connect();

    con.on('AuthenticationMD5Password', msg => {
      const md5Password = Utils.Md5Password(this.user, this.password, msg.salt);
      con.password(md5Password);
    });

    con.on('AuthenticationCleartextPassword', () => {
      con.password(this.password);
    });

    con.once('BackendKeyData', msg => {
      this.processID = msg.processID
      this.secretKey = msg.secretKey
    });

    con.on('ReadyForQuery', () => {
      // to do
      console.log('ReadyForQuery in client.js Need to improve');
      this.emit('ReadyForQuery');
    });

    con.once('end', () => {
      // const error = new Error(this.#end ? 'Connection terminated' : 'Connection terminated unexpectedly');
      const error = new Error(this[_end] ? 'Connection terminated' : 'Connection terminated unexpectedly');

      if (!this[_end]) {   // if(!this.#end) { 
        console.log(error);
        // to do
      }

      process.nextTick(() => {
        this.emit('end');
      });
    });

    return new Promise((resolve, reject) => {
      con.once('AuthenticationOk', message => {
        console.log('in client.js AuthenticationOk:', message)

        resolve(message.message);
      });

      con.once('error', err => {
        console.log('connection error:', err)

        reject(err);
      });
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

  query(sql) {
    const query = new Query();
    this.connection.query(sql);

    return new Promise((resolve, reject) => {
      this.connection.once('RowDescription', function (msg) {
        console.log('RowDescription', msg);
        query.handleRowDescription(msg);
      });

      this.connection.once('DataRow', function (msg) {
        console.log('DataRow', msg);
        query.handleDataRow(msg);
        resolve(query);
      });

      this.connection.once('CommandComplete', function (msg) {
        console.log('CommandComplete', msg);
      });

      this.connection.once('error', err => {
        console.log('query error:', err)

        reject(err);
      });
    })
  }

  cancel(client, query) {
    if (client.activeQuery === query) {
      const con = this.connection;

      if (this.host && this.host.indexOf('/') === 0) {
        con.connect(this.host + '/.s.PGSQL.' + this.port);
      } else {
        con.connect(this.port, this.host);
      }

      con.once('connect', function () {
        con.cancel(client.processID, client.secretKey);
      })
    } else if (!client.queryQueue.includes(query)) {
      client.queryQueue.splice(client.queryQueue.indexOf(query), 1);
    }
  }
}

module.exports = Client