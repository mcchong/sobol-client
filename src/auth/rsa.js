const { createSign } = require('crypto');
const decode = require('jwt-decode');
const Strategy = require('./strategy');

class RsaStrategy extends Strategy {
  constructor(params) {
    super(params);
    this._name = 'rsa';
  }

  /**
   * Decodes a base64 encoded string to ascii
   * @param {string} key (base64)
   * @returns {string} key (ascii)
   */
  _decodeKey(key) {
    return Buffer.from(key, 'base64').toString('ascii');
  }

  /**
   * Generates a RSA signature
   * @param {string} message
   * @param {date} timestamp
   * @param {string} privateKey
   * @returns {promise} signature
   */
  _signRsa(message, timestamp, privateKey) {
    return new Promise((resolve) => {
      const signer = createSign('RSA-SHA256');
      signer.update(message + timestamp);
      signer.end();
      const signature = signer.sign(this._decodeKey(privateKey), 'base64');
      resolve(signature);
    });
  }

  /**
   * Validates signature with API and gets back a JWT
   * @param {object} key
   * @param {string} signature
   * @param {date} timestamp
   * @returns {promise} encodedJwt
   */
  _login(key, signature, timestamp) {
    return this._request.post('/login/', {
      type: 'rsa',
      authorization: {
        signature,
        timestamp,
        kid: key.kid,
        alg: 'rsa-sha256',
        sig: 'base64',
      },
    })
      .then(response => response.data);
  }

  /**
   * Authenticates using RSA key signing
   * @returns {promise} session
   */
  authenticate(key) {
    return new Promise((resolve) => {
      if (typeof key === 'undefined') {
        throw new Error(`Missing Param: ${this._pkg.name} RSA auth strategy requires a "key" param.`);
      } else if (typeof key.kid === 'undefined' || typeof key.private === 'undefined') {
        throw new Error(`Missing Params: ${this._pkg.name} RSA auth strategy requires a "key.kid" and a "key.private" param.`);
      }

      const timestamp = Date.now();
      const getSession = this._signRsa(key.kid, timestamp, key.private)
        .then(signature => this._login(key, signature, timestamp))
        .then(encodedJwt => ({ ...decode(encodedJwt), jwt: encodedJwt }));

      resolve(getSession);
    });
  }
}

module.exports = RsaStrategy;
