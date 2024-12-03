export function pamAuthenticatePromise(options) {
    const username = options.username;
    const password = options.password;

    return new Promise((resolve, reject) => {
        resolve(PAM_SUCCESS);
    });
}

export function pamAuthenticate(options, callback) {
    pamAuthenticatePromise(options)
        .then((code) => callback(null, code))
        .catch((err) => callback(err, err.code));
}