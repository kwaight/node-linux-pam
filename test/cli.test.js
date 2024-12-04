const { pamErrors } = require('../index');
const { cli, userAdd, expiredUserAdd, userDel } = require('./helpers');

const USERNAME_OF_NON_EXISTENT_USER = 'cli-test-pam-non-existent-user';
const PASSWORD_OF_NON_EXISTENT_USER = 'cli-password';
const USERNAME_OF_AN_EXISTING_USER = 'cli-test-pam-user';
const PASSWORD_OF_AN_EXISTING_USER = 'cli-password';
const BAD_PASSWORD_OF_AN_EXISTING_USER = 'cli-bad-password';
const STDOUT_TEMPLATE = '"out {name} {code} {message}"';
const STDERR_TEMPLATE = '"err {name} {code} {message}"';

describe('CLI', () => {
  describe('when there is no user', () => {
    test(`should return an PamError with code ${pamErrors.PAM_AUTH_ERR}`, async () => {
      const { code, stderr } = await cli({
        username: PASSWORD_OF_NON_EXISTENT_USER,
        password: USERNAME_OF_NON_EXISTENT_USER,
      });

      expect(code).toBe(1);
      expect(parseInt(stderr)).toBe(pamErrors.PAM_AUTH_ERR);
    });
  });

  describe('when there is a user', () => {
    const username = USERNAME_OF_AN_EXISTING_USER + '2';
    beforeAll(() => {
      // Create user
      userAdd(username, PASSWORD_OF_AN_EXISTING_USER);
    });

    afterAll(() => {
      // Delete user
      userDel(username);
    });

    test(`should return code ${pamErrors.PAM_SUCCESS} with the correct password`, async () => {
      const { code, stdout } = await cli({
        username: username,
        password: PASSWORD_OF_AN_EXISTING_USER,
      });
      console.log('stdout', stdout);

      expect(code).toBe(0);
      expect(stdout).toBe('success');
    });

    test(`should return PamError with code ${pamErrors.PAM_AUTH_ERR} on wrong password`, async () => {
      const { code, stderr } = await cli({
        username: username,
        password: BAD_PASSWORD_OF_AN_EXISTING_USER,
      });

      expect(code).toBe(1);
      expect(parseInt(stderr)).toBe(pamErrors.PAM_AUTH_ERR);
    });
  });

  describe('when there is a user with an expired password', () => {
    beforeAll(() => {
      // Create expired user
      expiredUserAdd(username, PASSWORD_OF_AN_EXISTING_USER);
    });

    afterAll(() => {
      // Delete user
      userDel(username);
    });

    test(`should return an error with code ${pamErrors.PAM_NEW_AUTHTOK_REQD}`, async () => {
      const { code, stderr } = await cli({
        username: username,
        password: PASSWORD_OF_AN_EXISTING_USER,
      });

      expect(code).toBe(1);
      expect(parseInt(stderr)).toBe(pamErrors.PAM_NEW_AUTHTOK_REQD);
    });
  });

  describe('message template', () => {
    test('stdout should contain a string according to the template from the --stdout-template parameter', async () => {
      const { stdout } = await cli({
        username: PASSWORD_OF_NON_EXISTENT_USER,
        password: USERNAME_OF_NON_EXISTENT_USER,
        'stdout-template': STDOUT_TEMPLATE,
      });

      expect(stdout).toBe('out PAM_AUTH_ERR 7 Error: Authentication failure');
    });

    test('stderr should contain a string according to the template from the --stderr-template parameter', async () => {
      const { stderr } = await cli({
        username: PASSWORD_OF_NON_EXISTENT_USER,
        password: USERNAME_OF_NON_EXISTENT_USER,
        'stderr-template': STDERR_TEMPLATE,
      });

      expect(stderr).toBe('err PAM_AUTH_ERR 7 Error: Authentication failure');
    });
  });
});
