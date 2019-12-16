import mysql from 'mysql';
import { promisify } from 'util';
import databaseConfig from '../../config/config';

const connection = mysql.createConnection(databaseConfig);

connection.connect((err) => {
  if (err) {
    console.log('MySQL connection error: ' + err);
    return;
  }
});

// Promisify the connection query to avoid callback hell
connection.query = promisify(connection.query);

module.exports = connection;
