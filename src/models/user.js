import mysql from 'mysql';
import databaseConfig from '../../config/config';
import { promisify } from 'util';

const con = mysql.createConnection(databaseConfig);
// Promisify the connection query to avoid callback hell
con.query = promisify(con.query);

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
    WHERE u.id = ${userId}`
  );
};

export const getUserPermissions = (userId) => {
  return con.query(
    `SELECT permission_id
    FROM user_permissions
    WHERE user_id = ${userId}`
  );
};

export const createUserPermission = (userId, permissionId) => {
  return con.query(
    `INSERT INTO user_permissions (user_id, permission_id)
    VALUES (${userId}, ${permissionId})`
  );
};

export const deleteUserPermission = (userId, permissionId) => {
  return con.query(
    `DElETE FROM user_permissions
    WHERE user_id = ${userId}
    AND permission_id = ${permissionId}`
  );
};