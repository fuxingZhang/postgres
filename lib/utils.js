'use strict';

const crypto = require('crypto');

class Utils {
  /**
   * @param {String | Buffer} str 
   */
  static md5(str) {
    return crypto.createHash('md5').update(str, 'utf-8').digest('hex')
  }

  /**
   * @param {String} user 
   * @param {String} password 
   * @param {Buffer} salt 
   */
  static Md5Password(user, password, salt) {
    const md5 = Utils.md5(password + user);
    const md5WithSalt = Utils.md5(Buffer.concat([Buffer.from(md5), Buffer.from(salt)]));
    return 'md5' + md5WithSalt
  }
}
module.exports = Utils