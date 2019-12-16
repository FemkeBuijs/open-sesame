/**
 * @file All functionality regarding the user model
 * Using escaped variables
 */
 
import mysql from 'mysql';
import databaseConfig from '../../config/config';
import { promisify } from 'util';

const con = mysql.createConnection(databaseConfig);
// Promisify the connection query to avoid callback hell
con.query = promisify(con.query);

/**
 * Get a user role
 * @param userId
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

/**
 * Get a user's permissions
 * @param userId
 * @returns {Promise<*>}
 */
export const getUserPermissions = (userId) => {
  return con.query(
    `SELECT permission_id
    FROM user_permissions
    WHERE user_id = ?`,
    [userId]
  );
};

/**
 * Create a user permission connection
 * @param userId
 * @param permissionId
 * @returns {Promise<*>}
 */
export const createUserPermission = (userId, permissionId) => {
  return con.query(
    `INSERT INTO user_permissions
    SET
    user_id = ?,
    permission_id = ?`,
    [userId, permissionId]
  );
};

/**
 * Deletes a user permission connection
 * @param userId
 * @param permissionId
 * @returns {Promise<*>}
 */
export const deleteUserPermission = (userId, permissionId) => {
  return con.query(
    `DElETE FROM user_permissions
    WHERE user_id = ?
    AND permission_id = ?`,
    [userId, permissionId]
  );
};

/**
 * Creates a log when a user requests a permission
 * @param userId
 * @param permissionId
 * @param success Wether the permission was successfully granted
 * @returns {Promise<*>}
 */
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

/**
 * Gets logs for either a specific user or all logs
 * @param userId
 * @param limit How many items need to be returned, default 10/
 * This to avoid the server crashing with many logs
 * @returns {Promise<*>}
 */
export const getUserLogs = (userId = null, limit = 10) => {
  // If there is a userId available,
  // return the logs for a specific user
  if(userId) {
    return con.query(
      `SELECT * FROM logs
      WHERE user_id = ?
      LIMIT ?`,
      [userId, limit]
    );
  }

  // Otherwise return logs for all users
  return con.query(
    `SELECT * FROM logs
    LIMIT ?`,
    [limit]
  );
};
