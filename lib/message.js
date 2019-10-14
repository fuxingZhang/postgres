'use strict';

class Message {
  /**
   * @constructor
   * @param {Buffer} buffer 
   */
  constructor(buffer) {
    this.parseHeader(buffer);
    this.type = void 0;
    this.message = void 0;
  }

  parseHeader(buffer) {
    console.log(buffer);
    const header = buffer.toString('utf8', 0, 1);
    console.log({ header });
    console.log(buffer.readInt32BE(1));
    console.log(buffer.readInt32BE(5));
    console.log(buffer.toString('ascii', 9, 12));
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
  }

  parseE(buffer) {
    this.type = 'error';
    console.log(buffer.toString('utf8', 0, 1));
    console.log(buffer.indexOf(6, 0));
    const bufferLen = Buffer.byteLength(buffer);
    console.log({ bufferLen });
    console.log(buffer.readUInt32BE(1));
    console.log(buffer.readUInt32LE(1));
    const len = buffer.readInt32LE(1);
    console.log({ len });
    const type = buffer.toString('utf8', 5, 1);
    console.log({ type });
    const message = buffer.toString('ascii', 0, buffer.indexOf(0, 6));
    console.log({ message });
    this.message = message;
  }
}

module.exports = Message