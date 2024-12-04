const pam = require('./pam');
const PamError = require('./pam-error');
const pamErrors = require('./pam-errors');

/**
 * @param {Object} options
 * @param {string} options.username The name of the target user.
 * @param {string} options.password User password.
 * @param {string} [options.serviceName="login"] The name of the service to apply.
 * @param {string} [options.remoteHost=""] Sets the PAM_RHOST option via the pam_set_item(3) call.
 * @returns {Promise<number|PamError>}
 */
function pamAuthenticatePromise(options) {
  return new Promise((resolve, reject) => {
    pam(options, (err, code) => (!err ? resolve(code) : reject(new PamError(err, code))));
  });
}

/**
 * @param {Object} options
 * @param {string} options.username The name of the target user.
 * @param {string} options.password User password.
 * @param {string} [options.serviceName="login"] The name of the service to apply.
 * @param {string} [options.remoteHost=""] Sets the PAM_RHOST option via the pam_set_item(3) call.
 * @param {function} callback The callback function.
 */
function pamAuthenticate(options, callback) {
  pam(options, callback);
}

module.exports = {
  default: pam,
  pamAuthenticate,
  pamAuthenticatePromise,
  pamErrors,
  PamError,
};
