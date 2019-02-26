const request = require('./request');
const auth = require('./auth');
const { name, version } = require('../package.json');

class Core {
  /**
   * Provides the core functionality of the client
   * @returns {object} this
   */
  constructor() {
    this._pkg = {
      name,
      version,
    };

    return this;
  }

  /**
   * Issues a new session and sets the org and token ids
   * @param {string | object} key
   * @returns {object} this
   */
  _authenticate(key) {
    return auth.authenticate(key)
      .then((session) => {
        this._handleOrgs(session.orgIds);
        request.setToken(session.jwt);
        return this;
      });
  }

  /**
   * Creates a new session
   *
   * @param {object} params
   *
   * {
   *   key: LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUpR...,
   *   protocol: 'http',
   *   host: 'localhost',
   *   namespace: 'api',
   *   version: 'v1',
   *   endpoint: 'http://localhost/api/v1/',
   *   auth: AuthStrategy,
   *   authOptions: {
   *     ...
   *   },
   *   requestErrorHandler: SomeHandler,
   * }
   *
   * @returns {promise} client
   */
  connect(params) {
    return new Promise((resolve) => {
      if (typeof params.key === 'undefined') {
        throw new Error(`Missing Param: ${this._pkg.name} "connect()" requires a "key" param.`);
      }

      // set properties
      this._key = params.key;
      this._protocol = params.protocol || 'https';
      this._host = params.host || 'sobol.io/d';
      this._namespace = params.namespace || 'api';
      this._version = params.version || 'v1';
      this._endpoint = params.endpoint || `${this._protocol}://${this._host}/${this._namespace}/${this._version}`;
      this._headers = params.headers || {};
      this._authOptions = params.authOptions || {};

      // set the organization
      this.setOrg(params.orgId);

      // set request object
      this._request = request.init({
        endpoint: this._endpoint,
        headers: this._headers,
        errorHandler: params.requestErrorHandler || null,
      });

      // set auth strategy
      this._auth = auth.init({
        strategy: params.auth,
        strategyOptions: {
          ...this._authOptions,
          pkg: this._pkg, // pass the package details for use in the strategies
          request, // pass the request object for use in the strategies
        },
      });

      resolve(this._authenticate(this._key));
    });
  }

  /**
   * Invalidates current session
   * @returns {object} this
   */
  disconnect() {
    auth.deauthenticate();
    request.setToken(null);
    this.setKey(null);
    this.setOrg(null);
    return this;
  }

  /**
   * Sets a new key and re-authenticates the client
   * @param {string | object} key
   * @returns {promise} client
   */
  setKey(key) {
    this._key = key;
    if (key) {
      return this._authenticate(key);
    }

    return Promise.resolve();
  }

  /**
   * Sets a new access token
   * @param {string} token
   * @returns {void}
   */
  setToken(token) {
    auth.setToken(token);
    request.setToken(token);
  }

  /**
   * Sets a new org ID from a list of orgs
   * - if there is one, use it
   * - if there are multiple, enforce this._orgId
   *
   * @param {array} orgIds
   * @returns {void}
   */
  _handleOrgs(orgIds) {
    if (orgIds.length === 1) {
      this.setOrg(orgIds[0]);
    } else if (!orgIds.includes(this._orgId)) {
      throw new Error(`Invalid Param: ${this._pkg.name} requires a valid "orgId" param.`);
    }
  }

  /**
   * Sets a new org ID
   * @param {string} orgId
   * @returns {void}
   */
  setOrg(orgId) {
    this._orgId = orgId;
    this._orgPath = (orgId ? `/org/${this._orgId}` : null);
  }

  /**
   * Gets the current session
   * @returns {object} session
   */
  getSession() {
    return auth.getSession();
  }

  /**
   * Gets the current version of the client
   * @returns {string} version
   */
  getVersion() {
    return this._version;
  }
}

module.exports = Core;
