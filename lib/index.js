'use strict';

const net = require('net');
const Writer = require('./writer');

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
      // this._writeInt32('p', sql);
    });

    this.stream.on('data', buf => {
      console.log(buf);
      // buf.slice(0, 1).toString()
      const header = buf.toString('utf8', 0, 1);
      console.log({ header });
      console.log(buf.readInt32BE(1));
      console.log(buf.readInt32BE(5));
      console.log(buf.toString('ascii', 9, 12));
      switch (header) {
        case 'E':
          return this.parseE(buf)
      }
    });

    this.stream.on('error', error => {
      // if (error.code === 'ECONNRESET') return;
      console.log(error)
    });

    this.stream.on('close', () => {
      console.log('close')
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

    console.log(writer.buffer.toString())
    this.stream.write(writer.buffer);
  }

  parseE(buf) {
    console.log(buf.toString('utf8', 0, 1));

    console.log(buf.indexOf(6, 0));

    const bufLen = Buffer.byteLength(buf);
    console.log({ bufLen });
    console.log(buf.readUInt32BE(1));
    console.log(buf.readUInt32LE(1));
    const len = buf.readInt32LE(1);
    console.log({ len });
    const type = buf.toString('utf8', 5, 1);
    console.log({ type });
    const message = buf.toString('ascii', 0, buf.indexOf(0, 6));
    console.log({ message });
  }

  query(sql) {
    this._writeInt32('Q', sql);
  }

  _writeInt32(code, message) {
    const bodyLength = Buffer.byteLength(message);
    const len = 5 + bodyLength;
    const buf = Buffer.alloc(len);
    buf.write(code, 0);
    buf.writeInt32BE(len - 1, 1);
    buf.write(this.password, 5, bodyLength);
    this.stream.write(buf);
  }
}

module.exports = Pg