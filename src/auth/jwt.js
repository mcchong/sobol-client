const { decode } = require('jwt-decode');
const Strategy = require('./strategy');

class JwtStrategy extends Strategy {
  constructor(params) {
    super(params);
    this._name = 'jwt';
  }

  /**
   * Verifies if the supplied JWT is valid
   * @param {string} encodedJwt
   * @returns {promise} session
   */
  authenticate(encodedJwt) {
    return new Promise((resolve) => {
      if (typeof encodedJwt !== 'string') {
        throw new Error(`Invalid Param: ${this._pkg.name} JWT auth strategy requires the "key" to be a string.`);
      }

      resolve({ ...decode(encodedJwt), jwt: encodedJwt });
    });
  }
}

module.exports = JwtStrategy;
