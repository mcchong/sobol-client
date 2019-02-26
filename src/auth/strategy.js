class Strategy {
  /**
   * Instantiates an authentication strategy
   * @returns {string} this
   */
  constructor(params) {
    this._name = 'default_strategy';
    this._pkg = params.pkg;
    this._request = params.request;
    return this;
  }

  /**
   * Authenticates a strategy
   * @param {string} key
   * @returns {promise} session
   */
  authenticate(key) {
    return new Promise((resolve) => {
      if (typeof key === 'undefined') {
        throw new Error(`Missing Param: ${this._pkg.name} Default auth strategy requires a "key" param.`);
      }

      resolve(key);
    });
  }

  /**
   * Deauthenticates a strategy
   * @returns {promise} status
   */
  deauthenticate() {
    return new Promise((resolve) => {
      resolve();
    });
  }
}

module.exports = Strategy;
