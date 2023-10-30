import log4js from "log4js";
import mysql from 'mysql2';

/**
 * Creates connection and provides DBMS API client.
 */
export default class DatabaseManager {
    /**
     * @typedef DatabaseCredentials
     * @param {string} host - Database host.
     * @param {string} user - Database user.
     * @param {string} password - User password.
     * @param {number} [port = 3306] - Port of database, 3306 by default.
     */

    /**
     * Constructs DatabaseManager class
     */
    constructor() {
        this._logger = log4js.getLogger('DatabaseManager');
    }
 
    /**
     * Creates connection and provides DBMS Api client.
     * @param {DatabaseCredentials} databaseCredentials - Database credentials.
     * @returns {Connection} - Database connection and api client to use.
     */
    async connect( databaseCredentials ) {
        const connection = await mysql.createConnection({...databaseCredentials});
        await connection.connect( (err) => {
            this._logger.error(`${databaseCredentials.host}:${databaseCredentials.port || 3306}: Connection to database refused, ${err}`);
            throw err;
        });
        this._logger.info(`${databaseCredentials.host}:${databaseCredentials.port || 3306}: Connection to database established`);
        return connection;
    }
}