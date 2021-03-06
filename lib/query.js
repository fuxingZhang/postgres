'use strict';

const matchRegexp = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/;
const parsers = require('./parsers');

class Query {
  /**
   * @constructor
   */
  constructor() {
    this.command = null;
    this.rowCount = null;
    this.oid = null;
    this.rows = [];
    this.fields = [];
  }

  /**
   * @param {Object} msg
   */
  handleRowDescription(msg) {
    this.fields = msg.fields;
  }

  /**
   * @param {Object} msg
   */
  handleDataRow(msg) {
    const row = {};
    for (let i = 0, len = msg.fields.length; i < len; i++) {
      const { name, dataTypeID, format } = this.fields[i];
      const parser = parsers[format].get(dataTypeID);
      const val = msg.fields[i];
      row[name] = parser ? parser(val) : val;
    }

    this.rows.push(row);
  }

  /**
   * @param {Object} msg
   */
  handleCommandComplete(msg) {
    //const match = msg.text.match(matchRegexp);
    const match = matchRegexp.exec(msg.text);

    if (!match) return;

    this.command = match[1];

    if (match[3]) {
      this.oid = parseInt(match[2], 10);
      this.rowCount = parseInt(match[3], 10);
    } else if (match[2]) {
      this.rowCount = parseInt(match[2], 10);
    }
  }
}

module.exports = Query