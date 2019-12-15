import mysql from 'mysql';
import databaseConfig from '../../config/config';
import { promisify } from 'util';

const con = mysql.createConnection(databaseConfig);
// Promisify the connection query to avoid callback hell
con.query = promisify(con.query);

/**
 * @file
 * Using escaped variables
 */

/**
 * Get user.
 * @param userId:
 * @returns {Promise<*>}
 */
export const getUserRole = (userId) => {
  return con.query(
    `SELECT r.name
    FROM roles r
    INNER JOIN user_roles ur ON r.id = ur.role_id
    INNER JOIN users u ON ur.user_id = u.id
    WHERE u.id = ?`,
    [userId]
  );
};

export const getUserPermissions = (userId) => {
  return con.query(
    `SELECT permission_id
    FROM user_permissions
    WHERE user_id = ?`,
    [userId]
  );
};

export const createUserPermission = (userId, permissionId) => {
  return con.query(
    `INSERT INTO user_permissions
    SET
    user_id = ?,
    permission_id = ?`,
    [userId, permissionId]
  );
};

export const deleteUserPermission = (userId, permissionId) => {
  return con.query(
    `DElETE FROM user_permissions
    WHERE user_id = ?
    AND permission_id = ?`,
    [userId, permissionId]
  );
};

export const createUserLog = ({userId, permissionId, success}) => {
  return con.query(
    `INSERT INTO logs
    SET
    user_id = ?,
    permission_id = ?,
    success = ?`,
    [userId, permissionId, success]
  );
};

export const getUserLogs = (userId = null, limit = 2) => {
  if(userId) {
    return con.query(
      `SELECT * FROM logs
      WHERE user_id = ?
      LIMIT ?`,
      [userId, limit]
    );
  }

  return con.query(
    `SELECT * FROM logs
    LIMIT ?`,
    [limit]
  );
};
