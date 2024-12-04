const cli = require('./cli');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const userFile = path.join(__dirname, '../user.json');
const users = fs.existsSync(userFile) ? JSON.parse(fs.readFileSync(userFile, 'utf8')) : [];

function saveUsers() {
  fs.writeFileSync(userFile, JSON.stringify(users, null, 2));
}

/**
 * Add a user to the system.
 * @param {string} username The name of the user to add.
 * @param {string} password The password for the new user.
 */
function userAdd(username, password, expired = false) {
  if (process.env.NODE_ENV === 'test') {
    users.push({ username, password, expired: expired.toString() });
  } else {
    const command =
      process.platform === 'darwin'
        ? `sudo dscl . -create /Users/${username} && sudo dscl . -create /Users/${username} UserShell /bin/bash && sudo dscl . -create /Users/${username} RealName "${username}" && sudo dscl . -passwd /Users/${username} ${password}`
        : `useradd ${username} && echo ${username}:${password} | chpasswd`;

    try {
      execSync(command);
    } catch (error) {}
  }
}

/**
 * Delete a user from the system.
 * @param {string} username The name of the user to delete.
 */
function userDel(username) {
  if (process.env.NODE_ENV === 'test') {
    users = users.filter((user) => user.username !== username);
  } else {
    const command = process.platform === 'darwin' ? `sudo dscl . -delete /Users/${username}` : `userdel --force ${username}`;

    execSync(command);
  }
}

/**
 * Add a user with an expired password to the system.
 * @param {string} username The name of the user to add.
 * @param {string} password The password for the new user.
 */
function expiredUserAdd(username, password) {
  userAdd(username, password, true);
}

module.exports = {
  cli,
  userAdd,
  expiredUserAdd,
  userDel,
  users,
};
