const Strategy = require('./strategy');
const JwtStrategy = require('./jwt');

class Auth {
  /**
   * Instantiates an authentication strategy
   * @param {class} CustomStrategy
   * @returns {string} name
   */
  init(params) {
    const CustomStrategy = params.strategy;

    if (CustomStrategy && CustomStrategy.prototype instanceof Strategy) {
      this._strategy = new CustomStrategy(params.strategyOptions);
    } else {
      this._strategy = new JwtStrategy(params.strategyOptions);
    }

    return this;
  }

  /**
   * Authenticates a strategy
   * @param {string} key
   * @returns {promise} session
   */
  authenticate(key) {
    return this._strategy.authenticate(key)
      .then((session) => {
        this.setSession(session);
        return session;
      });
  }

  /**
   * Deauthenticates a strategy
   * @returns {promise}
   */
  deauthenticate() {
    return new Promise((resolve) => {
      this._strategy.deauthenticate()
        .then(() => {
          this.setSession(null);
          resolve();
        });
    });
  }

  /**
   * Sets a current session
   * @params {object} session
   * @returns {object} new session
   */
  setSession(session) {
    this._session = session;
    return this._session;
  }

  /**
   * Gets the current session
   * @returns {object} session
   */
  getSession() {
    return this._session;
  }

  /**
   * Sets a current session's token
   * @params {string} token
   * @returns {object} updated session
   */
  setToken(token) {
    if (this._session) this._session.jwt = token;
    return this._session;
  }
}

module.exports = new Auth();
