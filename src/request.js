const axios = require('axios');

class Request {
  /**
   * Extends the `axios` ajax library for use in the client
   * @param {string} endpoint (required)
   * @param {object} headers
   * @param {string} token
   * @returns {object} this
   */
  init(params) {
    if (typeof params.endpoint === 'undefined') {
      throw new Error('Missing Param: Request requires an "endpoint" param.');
    }
    this._endpoint = params.endpoint;
    this._headers = params.headers || {};

    if (params.token) this.setToken(params.token);
    if (params.errorHandler) this.setErrorHandler(params.errorHandler);

    return this;
  }

  /**
   * Throws all request errors
   * @param {object} error
   * @returns {object} error
   */
  _handleError(error) {
    return Promise.reject(error);
  }

  /**
   * Sets the authentication header
   * @param {string} token
   * @returns {void}
   */
  setToken(token) {
    const Authorization = (token ? `Bearer ${token}` : 'None');
    this._headers = {
      ...this._headers,
      Authorization,
    };
  }

  /**
   * Sets the error handler
   * @param {funciton} handler
   * @returns {void}
   */
  setErrorHandler(handler) {
    if (handler) this._handleError = handler;
  }

  /**
   * Makes a GET request
   * @param {string} path
   * @returns {promise} response
   */
  get(path) {
    return axios.get(`${this._endpoint}${path}`, {
      headers: this._headers,
    }).catch(this._handleError);
  }

  /**
   * Makes a POST request
   * @param {string} path
   * @param {object} data
   * @returns {promise} response
   */
  post(path, data) {
    return axios.post(`${this._endpoint}${path}`, data || {}, {
      headers: this._headers,
    }).catch(this._handleError);
  }

  /**
   * Makes a PUT request
   * @param {string} path
   * @param {object} data
   * @returns {promise} response
   */
  put(path, data) {
    return axios.put(`${this._endpoint}${path}`, data || {}, {
      headers: this._headers,
    }).catch(this._handleError);
  }

  /**
   * Makes a DELETE request
   * @param {string} path
   * @returns {promise} response
   */
  delete(path) {
    return axios.delete(`${this._endpoint}${path}`, {
      headers: this._headers,
    }).catch(this._handleError);
  }
}

module.exports = new Request();
