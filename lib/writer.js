'use strict';

class Writer {
  /**
   * @constructor
   * @param {Number} size size of buffer
   */
  constructor(size) {
    this.buffer = Buffer.alloc(size);
    this.offset = 0;
  }

  /**
   * get the size of buffer to be create
   * 
   * @param {Number} headerSize 
   * @param {Object} body 
   * 
   * @returns {Number} buffer size
   */
  static getSize(headerSize, body) {
    let size = headerSize + 1;

    // method 1
    const bodyStr = Object.entries(body).reduce((pre, next) => pre + next.join(''), '');
    size += Buffer.byteLength(bodyStr) + Object.keys(body).length * 2;

    // method 2
    // const keys = Object.keys(body);
    // const values = Object.values(body);
    // const bodyStr = keys.join('') + values.join('');
    // size += Buffer.byteLength(bodyStr) + keys.length*2;

    // method 3
    // Object.entries(body).forEach(item => {
    //   size += Buffer.byteLength(item.join()) + 2;
    // })

    return size
  }

  /**
   * @param {Number} value 
   */
  writeHeader(value) {
    this.buffer.write(value);
    this.offset++;
  }

  /**
   * @param {Number} value 
   */
  writeInt32(value) {
    this.buffer.writeInt32BE(value, this.offset);
    this.offset += 4;
  }

  /**
   * @param {Number} value 
   */
  writeInt16(value) {
    this.buffer.writeInt16BE(value, this.offset);
    this.offset += 2;
  }

  /**
   * @param {Object} body 
   */
  writeBody(body) {
    for (const [key, val] of Object.entries(body)) {
      const keyLength = Buffer.byteLength(key);
      this.buffer.write(key, this.offset, keyLength);
      this.offset += keyLength;
      this.buffer[this.offset++] = 0;

      const valLength = Buffer.byteLength(val);
      this.buffer.write(val, this.offset, valLength);
      this.offset += valLength;
      this.buffer[this.offset++] = 0;
    }
  }

  /**
   * @param {String} str 
   * @param {Number} len 
   */
  writeStr(str, len) {
    this.buffer.write(str, this.offset, len);
    this.offset += len;
  }
}

module.exports = Writer