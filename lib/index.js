const net = require('net');

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
    const bodyLength = Buffer.byteLength(`user${this.user}database${this.database}`) + 4 * 1 + 1;
    const len = 4 + 4 + bodyLength;
    console.log({len})
    const buf = Buffer.alloc(len);
    let offset = 0;
    buf.writeInt32BE(len, offset);
    offset += 4;
    buf.writeInt16BE(3, offset);
    offset += 2;
    buf.writeInt16BE(0, offset);
    offset += 2;
    
    const obj = {
      user: this.user,
      database: this.database
    };

    for(const key in obj) {
      buf.write(key, offset, Buffer.byteLength(key));
      offset += Buffer.byteLength(key);
      buf[offset++] = 0;

      const val = obj[key];
      buf.write(val, offset, Buffer.byteLength(val));
      offset += Buffer.byteLength(val);
      buf[offset++] = 0;
    }

    console.log(Buffer.byteLength(buf))
    console.log(buf.toString())
    this.stream.write(buf);

    // return
    // const bodyLength = Buffer.byteLength(`user${this.user}database${this.database}client_encoding'utf-8'`) + 7 * 1;
    // const len = 4 + 4 + bodyLength;
    // console.log({len})
    // const buf = Buffer.alloc(len);
    // buf.writeInt32BE(len, 0);
    // buf.writeInt16BE(3, 4);
    // buf.writeInt16BE(0, 6);
    // let offset = 8;
    // buf.write('user', offset, Buffer.byteLength('user'));
    // offset += Buffer.byteLength('user');
    // buf[offset++] = 0;

    // buf.write(this.user, offset, Buffer.byteLength(this.user));
    // offset += Buffer.byteLength(this.user);
    // buf[offset++] = 0;

    // buf.write('database', offset, Buffer.byteLength('database'));
    // offset += Buffer.byteLength('database');
    // buf[offset++] = 0;

    // buf.write(this.database, offset, Buffer.byteLength(this.database));
    // offset += Buffer.byteLength(this.database);
    // buf[offset++] = 0;

    // buf.write('client_encoding', offset, Buffer.byteLength('client_encoding'));
    // offset += Buffer.byteLength('client_encoding');
    // buf[offset++] = 0;

    // buf.write("'utf-8'", offset, Buffer.byteLength("'utf-8'"));
    // offset += Buffer.byteLength("'utf-8'");
    // buf[offset++] = 0;

    // console.log(buf)
    // console.log(buf.slice(50))
    // console.log(buf.length)
    // console.log(Buffer.byteLength(buf))
    // console.log(buf.toString())
    // this.stream.write(buf);
  }

  parseE(buf) {
    console.log(buf.toString('utf8', 0, 1));
    
    console.log( buf.indexOf(6, 0));

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