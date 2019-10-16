'use strict';

class Query {
  /**
   * @constructor
   */
  constructor() {
    this.rows = [];
    this.rowCount = void 0;
    this.fields = void 0;
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
      row[this.fields[i].name] = msg.fields[i];
    }

    this.rows.push(row);
  }
}

module.exports = Query