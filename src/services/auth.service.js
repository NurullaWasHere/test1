import jwt from 'jsonwebtoken';
import log4js from 'log4js';

/**
 * Manages authorization and authentication of users
 */
export default class AuthService {
  /**
   * @typedef {Object} UserDTO
   * @param {number} id - User id
   * @param {string} [email] - User email
   * @param {string} [password] - User password
   * @param {string} [nickname] - User nickname
   */

  /**
   * @typedef {Object} Tokens
   * @param {string} accessToken - Access token
   * @param {string} refreshToken - Refresh token
   */

  /**
   * Constructs AuthService class
   * @param {Connection} connection - DBMS api client to use.
   * @param {string} jwtSecret - Auth validator instance to validate and sign tokens.
   */
  constructor(connection, jwtSecret = process.env.JWT_SECRET) {
    this._logger = log4js.getLogger('AuthService');
    this.connection = connection;
    this.jwtSecret = jwtSecret;
  }
  /**
   * Sign in a user and returns a bearer token
   * @param {UserDTO} payload
   * @returns {string} - access token
   */
  async signIn(payload) {
    this.authValidator.verifyUser(payload);
    const result = await this.connection.query(`SELECT * FROM users WHERE id = ${payload.id} AND password = ${payload.password}`, (err) => {
      if (err) {
        this._logger.error(`Failed to select user ${payload.toString()}: from users table`, err);
        throw err;
      }
    });
    this._logger.info(`Successfully selected user ${payload.toString()} from users table`);
    const tokens = this._generateTokens(result.insertId);
    return tokens;
  }

  /**
   * Updates auth token pairs with refresh token
   * @param {string} refreshToken
   * @returns {Tokens} - access token
   */
  updateTokens(refreshToken) {
    if(!refreshToken) {
      throw new Error('No refresh token provided');
    }
    const payload = jwt.verify(refreshToken, this.jwtSecret || process.env.JWT_SECRET);
    if(payload) {
      throw new Error('Invalid refresh token');
    }
    const tokens = this._generateTokens(payload.id);
    return tokens;
  }

  /**
   * Sign up a new user and returns token pairs
   * @param {UserDTO} payload
   * @returns {Tokens} token
   */
  async signUp(payload) {
    this.authValidator.verifyUser(payload);
    const result = await this.connection.query(`INSERT INTO users (email, password, nickname) VALUES 
      (${payload.email}, ${payload.password}, ${payload.nickname})`, (err, result) => {
      if (err) {

        this._logger.error(`Failed to insert user ${payload.toString()}: ${err} into users table`);
        throw err;
      }});
      this._logger.info(`Successfully inserted user ${payload.toString()} into users table`);
    return this._generateTokens(result.insertId);
  }

  /**
   * Returns id number by the token.
   * @param {string} token - access token of current user.
   * @returns {number} - id number of user
   */
  info(token) {
    const payload = jwt.verify(token, this.jwtSecret || process.env.JWT_SECRET);
    return payload;
  }

  /**
   * Signs out a user
   * @param {string} token - access token of current user.
   */
  signOut(accessToken, refreshToken) {
    const userId = this.info(token);
    jwt.destroy(accessToken);
    jwt.destroy(refreshToken);
    this._logger.info(`Successfully signed out user with id ${userId}`);
  }

  _generateTokens(id) {
    const accessToken = jwt.sign({id}, this.jwtSecret || process.env.JWT_SECRET, {expiresIn: '1d'});
    const refreshToken = jwt.sign({id}, this.jwtSecret || process.env.JWT_SECRET, {expiresIn: '30d'});
    return {
      accessToken,
      refreshToken
    }
  }
}