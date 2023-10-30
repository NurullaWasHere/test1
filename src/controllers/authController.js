import log4js from 'log4js';
/**
 * Auth controller module.
 */
export default class AuthController {
    /**
     * Constructs AuthController class
     * @param {AuthService} authService - Auth service instance to use.
     */
    constructor(authService) {
        this._logger = log4js.getLogger('AuthController');
        this.authService = authService;
    }

    /**
     * Sign in a user and returns a bearer token
     * @param {UserDTO} payload - User credentials to sign in
     * @returns {Tokens} - returns token pairs
     */
    async signIn(req, res) {
      try {
        const tokens = await this.authService.signIn(req.body);
        res.status(200).json({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          message: 'Successfully signed in',
        });
      } catch (error) {
        this._logger.error(`Failed to sign in user ${req.body.toString()}`, error);
      }
    }

    /**
     * Refreshes tokens
     * @returns {Promise<Object>} - returns endpoint result
     */
    async refreshTokens(req, res) {
      try {
        const tokens = await this.authService.updateTokens(req.body.refreshToken);
        return res.status(200).json({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          message: 'Successfully refreshed tokens',
        });
      } catch (error) {
        this._logger.error(`Failed to refresh tokens`, error);
      }
    }

    /**
     * Signs up a new user
     * @returns {Promise<Object>} - returns endpoint result
     */
    async signUp(req, res) {
      try {
        const tokens = await this.authService.signUp(req.body);
        return res.code(200).json({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          message: 'Successfully signed up',
        })
      } catch (error) { 
        this._logger.error(`Failed to sign up user ${req.body.toString()}`, error);
      }
    }

    /**
     * Info about user
     * @returns {number} - returns id number of user
     */
    info(req, res) {
      try {
        const userId = this.authService.info(req.headers.authorization);
        return res.code(200).json({
          message: 'Successfully got user info',
          userId,
        })
      } catch (error) {
        this._logger.error(`Failed to get user info`, error);
      }
    }

    /**
     * Logs out a user
     * @returns {void}
     */
    logOut(req, res) {
      try {
        this.authService.signOut(req.headers.authorization, req.headers.refreshToken);
        return res.code(200).json({
          message: 'Successfully logged out',
        });
      } catch (error) {
        this._logger.error(`Failed to log out user`, error);
      }
    }
}