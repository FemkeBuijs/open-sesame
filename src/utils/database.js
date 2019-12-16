import mysql from 'mysql';
import databaseConfig from '../../config/config';

const connection = mysql.createConnection(databaseConfig);

connection.connect((err) => {
  if (err) {
    console.log('MySQL connection error: ' + err);
    return;
  }
});

module.exports = connection;
