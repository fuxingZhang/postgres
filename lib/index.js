'use strict';

const net = require('net');
const Writer = require('./writer');
const Message = require('./message');

class Pg {
  constructor(config) {
    this.user = config.user;
    this.host = config.host;
    this.database = config.database;
    this.password = config.password;
    this.port = config.port;
    this.ssl = config.ssl;
    this.stream = new net.Socket();
    this.connect();
  }

  connect() {
    this.stream.connect({
      port: this.port
    });

    this.stream.on('connect', () => {
      console.log('connect');
      this.startup();
      // this.stream.setKeepAlive(true);
    });

    this.stream.on('data', buffer => {
      const message = new Message(buffer);
      console.log(message);
    });

    this.stream.on('error', error => {
      // if (error.code === 'ECONNRESET') return;
      console.log(error);
    });

    this.stream.on('close', () => {
      console.log('close');
    });
  }

  startup() {
    const body = {
      user: this.user,
      database: this.database
    };

    const size = Writer.getSize(8, body);
    console.log({ size });

    const writer = new Writer(size);
    writer.writeInt32(size);
    writer.writeInt16(3);
    writer.writeInt16(0);
    writer.writeBody(body);

    this.stream.write(writer.buffer);
  }

  query(sql) {
    // to do
  }
}

module.exports = Pg