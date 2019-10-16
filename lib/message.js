'use strict';

const util = require('util');

class Message {
  #chunk;
  #length;
  #header;
  #offset = 0;

  /**
   * @constructor
   * @param {Buffer} chunk 
   * @param {Number} length 
   * @param {String} buffer 
   */
  constructor({ chunk, length, header }) {
    console.log({ chunk, length, header })
    this.#chunk = chunk;
    this.#length = length;
    this.#header = header;
    this.parseMessage();
  }

  parseMessage() {
    switch (this.#header) {
      case 'R':
        return this.parseR();
      case 'E':
        return this.parseE();
      case 'T':
        return this.parseT();
      case 'S':
          return this.parseS();
      default: 
        throw new Error(`Unprocessed header: ${this.#header}`);
    }
  }

  /**
   * Identifies the message as a run-time parameter status report
   */
  parseS() {
    console.log('parseS ===>');
    this.name = 'ParameterStatus';
    this.parameterName = this.readZeroString();
    this.parameterValue = this.readZeroString();
  }

  /**
   * Identifies the message as an authentication request
   */
  parseR() {
    console.log('parseR ===>');

    const code = this.readInt32();

    console.log({
      code,
      length: this.#length
    });

    switch (code) {
      case 0:
        this.name = 'AuthenticationOk';
        this.message = this.#chunk.toString('ascii');
        break;
      case 3:
        if (this.#length === 8) {
          this.name = 'AuthenticationCleartextPassword';
        } else {
          this.name = `parseR code 3, length expect 8, get ${this.#length}`;
        }
        break;
      case 5:
        if (this.#length === 12) {
          this.name = 'AuthenticationMD5Password';
          this.salt = this.#chunk.slice(this.#offset, this.#offset + 4);
        } else {
          this.name = `parseR code 5, length expect 12, get ${this.#length}`;
        }
        break;
      default:
        throw new Error('Unknown Authentication type' + util.inspect({
          code,
          message: this.#chunk.slice(this.#offset, this.#offset + 4)
        }));
    }
  }

  /**
   * Identifies the message as a row description
   */
  parseT() {
    this.name = 'RowDescription';

    const fieldCount = this.readInt16();
    console.log('parseT fieldCount:', fieldCount);

    const fields = [];
    for(let i = 0; i< fieldCount; i++) {
      const name = this.readZeroString();
      console.log('parseT name:', name);
  
      const tableID = this.readInt32();
      console.log('parseT tableID:', tableID);
  
      const columnID = this.readInt16();
      console.log('parseT columnID:', columnID);
  
      const dataTypeID = this.readInt32();
      console.log('parseT dataTypeID:', dataTypeID);
  
      const dataTypeSize = this.readInt16();
      console.log('parseT dataTypeSize:', dataTypeSize);
  
      const dataTypeModifier = this.readInt32();
      console.log('parseT dataTypeModifier:', dataTypeModifier);
  
      const mode = this.readInt16();
      console.log('parseT mode:', mode);
  
      console.log({
        offset: this.#offset,
        len: Buffer.byteLength(this.#chunk)
      })
      const format = mode === 0 ? 'text' : 'binary'; // Currently will be zero (text) or one (binary).

      fields.push({
        name,
        tableID,
        columnID,
        dataTypeID,
        dataTypeSize,
        dataTypeModifier,
        format
      });
    }

    this.fields = fields;
    // console.log(fields);
  }

  /**
   * Identifies the message as an error
   */
  parseE() {
    this.name = 'error';
    console.log(this.#chunk.toString());

    const fields = {};

    let fieldType = this.readString(1);
    console.log({ fieldType });

    while (fieldType !== '\0') {
      fields[fieldType] = this.readZeroString();
      fieldType = this.readString(1);
    }
    console.log({ fields });

    this.message = fields.M;
    this.severity = fields.S;
    this.code = fields.C;
    this.detail = fields.D;
    this.hint = fields.H;
    this.position = fields.P;
    this.internalPosition = fields.p;
    this.internalQuery = fields.q;
    this.where = fields.W;
    this.schema = fields.s;
    this.table = fields.t;
    this.column = fields.c;
    this.dataType = fields.d;
    this.constraint = fields.n;
    this.file = fields.F;
    this.line = fields.L;
    this.routine = fields.R;
  }

  readInt16() {
    const value = this.#chunk.readInt16BE(this.#offset);
    this.#offset += 2;

    return value
  }

  readInt32() {
    const value = this.#chunk.readInt32BE(this.#offset);
    this.#offset += 4;

    return value
  }

  readString(length) {
    return this.#chunk.toString('utf8', this.#offset, this.#offset += length)
  }

  readZeroString() {
    const start = this.#offset;
    const end = this.#chunk.indexOf(0, start);
    this.#offset = end + 1;
    return this.#chunk.toString('utf8', start, end)
  }
}

module.exports = Message