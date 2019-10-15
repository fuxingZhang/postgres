'use strict';

class Reader {
  /**
   * @constructor
   * @param {Object} options
   */
  constructor(options = {}) {
    this.offset = 0;
    this.chunk = void 0;
    this.chunkLength = 0;
    this.headerSize = options.headerSize || 1;
    this.lengthSize = options.lengthSize || 4;
    this.header = void 0;
  }

  addChunk(chunk) {
    if (!this.chunk) {
      this.chunk = chunk;
      this.chunkLength = Buffer.byteLength(chunk);
      this.offset = 0;
      return
    }

    this.chunk = Buffer.concat([this.chunk, chunk]);
    this.chunkLength += Buffer.byteLength(chunk);
  }

  read() {
    if (this.chunkLength < (this.headerSize + this.lengthSize + this.offset)) return false;

    if (this.headerSize) this.header = this.chunk.toString('utf8', this.offset, 1);

    //readUInt32BE
    const length = this.chunk.readInt32BE(this.offset + this.headerSize) - this.lengthSize;

    const remaining = this.chunkLength - (this.offset + this.headerSize + this.lengthSize);
    if (length > remaining) return false;

    this.offset += this.headerSize + this.lengthSize + length;
    const result = this.chunk.slice(this.offset, this.offset + length);

    return result
  }
}

module.exports = Reader