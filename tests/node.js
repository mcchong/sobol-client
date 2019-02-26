/* eslint no-console: 0 */

const SobolApi = require('../src/index');
const SobolRsaAuth = require('../src/auth/rsa');
const SobolClient = require('../src/client');

// KEYS
const key1 = {
  kid: '',
  private: '',
};

const key2 = {
  kid: '',
  private: '',
};

// USE CLIENT DIRECTLY
SobolApi.connect({
  key: key1,
  protocol: 'http',
  host: 'localhost',
  auth: SobolRsaAuth,
})
  .then((client) => {
    const { user } = client.getSession();
    const { Users } = client;

    return Users.find()
      .then((res) => {
        const users = res.data;

        // check for automated users
        console.log(
          'Automated Users?',
          (users.includes(user)
            ? 'Yup! That\'s bad :('
            : 'Nope! Yay that\'s good!'
          ),
        );

        // kill the session
        client.disconnect();
      });
  })
  .catch(e => console.error(e));

// EXTEND AND USE THE CLIENT
class MyClient extends SobolClient {
  constructor() {
    super();

    this.Applications = {
      find: () => this._request.get(`${this._orgPath}/applications`),
    };
  }
}

const Client = new MyClient();

Client.connect({
  key: key1,
  protocol: 'http',
  host: 'localhost',
  auth: SobolRsaAuth,
})
  .then((client) => {
    const { Applications } = client;
    return Applications.find()
      .then((res) => {
        console.log('Applications:', res.data);
        client.disconnect();
      });
  })
  .catch(e => console.error(e));

// TEST OTHER METHODS
SobolApi.connect({
  key: key1,
  protocol: 'http',
  host: 'localhost',
  auth: SobolRsaAuth,
})
  .then((client) => {
    const clientJwt = client.getSession().jwt;
    console.log('Version:', client.getVersion());

    return client.setKey(key2)
      .then((client2) => {
        console.log('Set New Keys:', client2._key.kid);

        // SET NEW TOKEN
        client2.setToken(clientJwt);
        console.log('Set New Token:', client2.getSession().jwt);

        // Set New Org
        client2.setOrg('NewOrg');
        console.log('Set New Org:', client2._orgId);
      });
  })
  .catch(e => console.error(e));
