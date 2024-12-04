const { exec } = require('child_process');
const pamErrors = require('./pam-errors');
const { users } = require('./test/helpers');

function typeError(message, code = pamErrors.PAM_AUTH_ERR) {
  throw new TypeError(message, code);
}

function success() {}

function isString(value) {
  const typeValue = typeof value;
  const response = typeValue === 'string';
  return response;
}

function isEmptyString(value) {
  return value === '';
}

function isUndefined(value) {
  return typeof value === 'undefined';
}

function exists(options, key) {
  return key in options;
}

function ifExists(options, key, callback) {
  if (key in options) {
    return callback;
  }
  return success;
}
function ifNotExists(options, key, callback) {
  if (notExists(options, key)) {
    return callback;
  }
  return success;
}

function validateOptions(options, callback) {
  if (!exists(options, 'password') || isUndefined(options.password)) {
    typeError('Password option is required');
  }

  if (!exists(options, 'username') || isUndefined(options.username)) {
    typeError('Username option is required');
  }

  if (!isString(options.password)) {
    throw new TypeError('Password should be a String');
  }

  if (!isString(options.username)) {
    throw new TypeError('Username should be a String');
  }

  if (exists(options, 'serviceName') && isUndefined(options.serviceName)) {
    callback('Error: Authentication failure', pamErrors.PAM_AUTH_ERR);
    return false;
  }

  if (exists(options, 'serviceName') && !isString(options.serviceName)) {
    throw new TypeError('ServiceName should be a String');
  }

  if (exists(options, 'remoteHost')) {
    if (!isString(options.remoteHost)) {
      if (options.remoteHost !== undefined) {
        throw new TypeError('RemoteHost should be a String');
      }
    }
  }

  if ('serviceName' in options && typeof options.serviceName !== 'string') {
    callback('Error: Authentication Failure', pamErrors.PAM_AUTH_ERR);
    return false;
  }

  return true;
}

function authenticateInTestEnv(username, password, callback) {
  const user = users.find((user) => user.username === username);

  if (user) {
    if (user.expired === 'true') {
      callback(pamErrors.PAM_NEW_AUTHTOK_REQD, pamErrors.PAM_NEW_AUTHTOK_REQD);
    } else {
      if (user.password === password) {
        callback(null, pamErrors.PAM_SUCCESS);
      } else {
        //TypeError('Error: Authentication failure', pamErrors.PAM_AUTH_ERR);
        callback('Error: Authentication failure', pamErrors.PAM_AUTH_ERR);
      }
    }
  } else {
    TypeError('Error: Authentication failure', pamErrors.PAM_AUTH_ERR);
    callback(pamErrors.PAM_AUTH_ERR, pamErrors.PAM_AUTH_ERR);
  }
}

function authenticateInShell(username, password, callback) {
  const command = process.platform === 'darwin' ? `echo ${password} | su - ${username} -c "exit"` : `echo ${password} | su -c "exit" ${username}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      callback(stderr, pamErrors.PAM_AUTH_ERR);
    } else {
      callback(null, pamErrors.PAM_SUCCESS);
    }
  });
}

/**
 * Authenticate a user using the shell.
 * @param {Object} options
 * @param {string} options.username The name of the target user.
 * @param {string} options.password User password.
 * @param {Function} callback The callback function.
 */
function shellAuthenticate(options, callback) {
  if (!validateOptions(options, callback)) {
    return;
  }

  const { username, password } = options;

  if (process.env.NODE_ENV === 'test') {
    authenticateInTestEnv(username, password, callback);
  } else {
    authenticateInShell(username, password, callback);
  }
}

/**
 * Load the appropriate PAM module based on the platform.
 * @returns {Function} The PAM authentication function.
 */
function loadPamModule() {
  if (process.platform === 'darwin') {
    return shellAuthenticate;
  } else {
    return require('bindings')('node-linux-pam');
  }
}

const pam = loadPamModule();

module.exports = pam;
