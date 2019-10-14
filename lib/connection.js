'use strict';

const net = require('net');
const Writer = require('./writer');
const Message = require('./message');

class Connection {
  constructor(config) {
    this.user = config.user;
    this.host = config.host;
    this.database = config.database;
    this.password = config.password;
    this.port = config.port;
    this.ssl = config.ssl;
    this.stream = new net.Socket();
  }

  connect() {
    return new Promise((resolve, reject) => {
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
        console.log(message.name, message.message);
      });

      this.stream.on('error', error => {
        // if (error.code === 'ECONNRESET') return;
        console.log(error);
        reject(error);
      });

      this.stream.on('close', () => {
        console.log('close');
      });
    })
  }

  end() {
    this._ending = true;

    const buffer = Buffer.alloc(5);

    buffer.write('X');
    buffer.writeInt32BE(4, 1);

    return this.stream.write(buffer, () => {
      this.stream.end();
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
}

module.exports = Connection