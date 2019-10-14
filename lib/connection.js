'use strict';

const net = require('net');
const Writer = require('./writer');
const Message = require('./message');
const EventEmitter = require('events');

class Connection extends EventEmitter {
  #end = false;

  constructor(config) {
    super();
    this.user = config.user;
    this.host = config.host;
    this.database = config.database;
    this.port = config.port;
    this.ssl = config.ssl;
    this.stream = new net.Socket();
  }

  connect() {
    this.stream.connect({
      port: this.port
    });

    this.stream.on('connect', () => {
      this.startup();
      // this.stream.setKeepAlive(true);
    });

    this.stream.on('data', buffer => {
      const message = new Message(buffer);
      // console.log(message);
      console.log(message.name);

      this.emit(message.name, message);
    });

    this.stream.on('error', error => {
      console.log('connection error:', error);
      if (error.code === 'ECONNRESET') return;

      this.emit('error', error);
    });

    this.stream.on('close', () => {
      this.emit('end');
    });

    this.stream.on('end', () => {
      this.emit('end');
    });
  }

  startup() {
    const body = {
      user: this.user,
      database: this.database
    };

    const size = Writer.getSize(8, body);

    const writer = new Writer(size);
    writer.writeInt32(size);
    writer.writeInt16(3);
    writer.writeInt16(0);
    writer.writeBody(body);

    this.stream.write(writer.buffer);
  }

  password(password) {
    const passwordLen = Buffer.byteLength(password);
    const size = 1 + 4 + passwordLen + 1; // Byte1('p') + Int32 + String + 1(null terminator)

    const writer = new Writer(size);
    writer.writeHeader('p');
    writer.writeInt32(size - 1);
    writer.writeStr(password, passwordLen);

    this.stream.write(writer.buffer);
  }

  end() {
    this.#end = true;

    const buffer = Buffer.alloc(5);

    buffer.write('X');
    buffer.writeInt32BE(4, 1);

    return this.stream.write(buffer, () => {
      this.stream.end();
    });
  }
}

module.exports = Connection