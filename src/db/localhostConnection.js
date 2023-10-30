import DatabaseManager from "./dbManager.js";
const mySQLManager = new DatabaseManager();
/**
 * Provides connection to local MySQL database.
 */
let connection;
mySQLManager.connect({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
}).then( (result) => {
    connection = result;
});
export {connection};