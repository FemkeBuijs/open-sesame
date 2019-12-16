/**
 * @file All functionality regarding the user model
 * Using escaped variables
 */

import {
  getUserRole,
  getUserPermissions,
  createUserPermission,
  deleteUserPermission,
  createUserLog,
  getUserLogs,
} from '../models/user';

import {
  authorizedRolesToUpdatePermissions,
  authorizedRolesForLogs,
} from '../utils/permissions';


/**
 * Update a user's permissions
 * @param req Information regarding the HTTPS request
 * @param res Used to return the desired response
 * @returns {String}
 */
export const updatePermissions = async (req, res) => {
  const { userIdToAuthorize, requesterId, permissions } = req.body;

  // Check if the user is trying to update its own permissions
  if ( userIdToAuthorize === requesterId ) {
    res.send('You\'re not allowed to update your own permissions you cheeky little monkey');
    return;
  }

  try {
    // Check if the user is allowed to update permissions
    const roles = await getUserRole(requesterId);
    const intersection = roles.filter(role => authorizedRolesToUpdatePermissions.includes(role.name));

    if (!intersection.length) {
      res.send('You\'re not cool enough to update permissions. Maybe try to get a promotion first.');
      return;
    }

    const query = await getUserPermissions(userIdToAuthorize);
    const userPermissions = query.map(item => item.permission_id);

    // Check which permissions need to be added and which ones need to be deleted
    const permissionsToDelete = userPermissions.filter(id => !permissions.includes(id));
    const permissionsToAdd = permissions.filter(id => !userPermissions.includes(id));
    const deletions = permissionsToDelete.map(id => deleteUserPermission(userIdToAuthorize, id));
    const insertions = permissionsToAdd.map(id => createUserPermission(userIdToAuthorize, id));

    await Promise.all(deletions);
    await Promise.all(insertions);

    res.send(`Authorization updated for user with tag ${userIdToAuthorize}`);
  } catch(e) {
    res.status(400).send('Something went wrong');
  }
};

/**
 * Authorize a user
 * @param req Information regarding the HTTPS request
 * @param res Used to return the desired response
 * @returns {String}
 */
export const authorizeUser = async (req, res) => {
  const { userId, permissionId } = req.body;

  try {
    const query = await getUserPermissions(userId);
    const userPermissions = query.map(item => item.permission_id);

    // If the users permissions includes the requested permissions,
    // using a concept where the function always defaults to 'Access Denied',
    // for example if the database returns something ambiguous.
    if (userPermissions.includes(permissionId)) {
      // Log the event as successful
      createUserLog({
        userId,
        permissionId,
        success: true,
      });

      // Anything can be send here,
      res.send(200, {
        'authorized': true,
        'message': 'The treasure has been unlocked'
      });
      return;
    }

    // Log the event as unsuccessful
    createUserLog({
      userId,
      permissionId,
      success: false,
    });
    res.send(200, {
      'authorized': false,
      'message': 'Access Denied'
    });
  } catch(e) {
    res.status(400).send('Something went wrong');
  }
};

/**
 * Get history logs
 * @param req Information regarding the HTTPS request
 * @param res Used to return the desired response
 * @returns {Array}
 */
export const getHistoryLogs = async (req, res) => {
  const { requesterId, userIdForLogs, limit } = req.body;

  try {
    // Check if the user is allowed to request logs
    const roles = await getUserRole(requesterId, limit);
    const intersection = roles.filter(role => authorizedRolesForLogs.includes(role.name));

    if (!intersection.length && requesterId !== userIdForLogs) {
      res.send('Nope, no logs for you!');
      return;
    }

    const logs = await getUserLogs(userIdForLogs, limit);

    res.send(logs);
  } catch(e) {
    res.status(400).send('Something went wrong');
  }
};
