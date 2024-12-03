

const pamAuthenticatePromise = (options) => {
    const username = options.username;
    const password = options.password;

    return new Promise((resolve, reject) => {
        resolve(PAM_SUCCESS);
    });
}

const pamAuthenticate = (options, callback) => {
    pamAuthenticatePromise(options)
        .then((code) => callback(null, code))
        .catch((err) => callback(err, err.code));
}

module.exports = {
    pamAuthenticate,
    pamAuthenticatePromise,
};