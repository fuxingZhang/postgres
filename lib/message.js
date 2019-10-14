'use strict';

class Message {
  /**
   * @constructor
   * @param {Buffer} buffer 
   */
  constructor(buffer) {
    this.name = void 0;
    this.message = void 0;
    this.parseHeader(buffer);
  }

  parseHeader(buffer) {
    const header = buffer.toString('utf8', 0, 1);
    console.log({ header });
    console.log(buffer.toString('ascii', 9));
    switch (header) {
      case 'R':
        return this.parseR(buffer);
      case 'E':
        return this.parseE(buffer);
    }
  }

  parseR(buffer) {
    console.log('parseR')
    console.log(buffer);
    let offset = 1;
    const length = buffer.readInt32BE(offset);
    offset += 4;

    const code = buffer.readInt32BE(offset);
    offset += 4;

    switch (code) {
      case 5:
        if (length === 12) {
          this.name = 'AuthenticationMD5Password';
          this.message = buffer.toString('ascii', offset);
          console.log(this.name, this.message)
        } else {
          console.log(`parseR code 5, length expect 12, get ${length}`);
        }
        break;
    }
  }

  parseE(buffer) {
    this.name = 'error';
    console.log(buffer.toString('utf8', 0, 1));
    console.log(buffer.indexOf(6, 0));
    const bufferLen = Buffer.byteLength(buffer);
    console.log({ bufferLen });
    console.log(buffer.readUInt32BE(1));
    console.log(buffer.readUInt32LE(1));
    const len = buffer.readInt32LE(1);
    console.log({ len });
    const name = buffer.toString('utf8', 5, 1);
    console.log({ name });
    const message = buffer.toString('ascii', 0, buffer.indexOf(0, 6));
    console.log({ message });
    this.message = message;
  }
}

module.exports = Message