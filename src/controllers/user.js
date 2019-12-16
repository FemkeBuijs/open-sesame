/**
 * @file All functionality regarding the user model
 * Using escaped variables
 */

import {
  getUser,
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

  // Check if there is a requester id present
  if (!requesterId) {
    res.status(403).send('Unknown requester ID');
    return;
  }

  // Check if there is a requester id present
  if (!userIdToAuthorize) {
    res.status(400).send('User ID to authorize not recognised');
    return;
  }

  // Check if the requester is trying to update its own permissions
  if ( userIdToAuthorize === requesterId ) {
    res.status(403).send('You\'re not allowed to update your own permissions you cheeky little monkey');
    return;
  }

  try {
    // Check if the requester is allowed to update permissions
    const roles = await getUserRole(requesterId);
    const intersection = roles.filter(role => authorizedRolesToUpdatePermissions.includes(role.name));

    if (!intersection.length) {
      res.status(403).send('You\'re not cool enough to update permissions. Maybe try to get a promotion first.');
      return;
    }

    // Check if user exists
    const user = await getUser(userIdToAuthorize);

    if (!user.length) {
      res.status(400).send('No user found with this ID');
      return;
    }

    // Get the current permissions of the user
    const query = await getUserPermissions(userIdToAuthorize);
    const userPermissions = query.map(item => item.permission_id);

    // Check which permissions need to be added and which ones need to be deleted
    const permissionsToDelete = userPermissions.filter(id => !permissions.includes(id));
    const permissionsToAdd = permissions.filter(id => !userPermissions.includes(id));
    const deletions = permissionsToDelete.map(id => deleteUserPermission(userIdToAuthorize, id));
    const insertions = permissionsToAdd.map(id => createUserPermission(userIdToAuthorize, id));

    await Promise.all(deletions);
    await Promise.all(insertions);

    res.status(200).send(`Authorization updated for user with tag ${userIdToAuthorize}`);
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
    // for example if the database returns something ambiguous or if the request was
    // faulty
    if (userPermissions.includes(permissionId)) {
      // Log the event as successful
      createUserLog({
        userId,
        permissionId,
        success: true,
      });

      // Anything can be send here,
      res.status(200).send({
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
    res.status(200).send({
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

  // Check if there is a requester id present
  if (!requesterId) {
    res.status(403).send('Unknown requester ID');
    return;
  }

  try {
    // Check if the user is allowed to request logs
    const roles = await getUserRole(requesterId, limit);
    const intersection = roles.filter(role => authorizedRolesForLogs.includes(role.name));

    if (!intersection.length && requesterId !== userIdForLogs) {
      res.status(403).send('Nope, no logs for you!');
      return;
    }

    const logs = await getUserLogs(userIdForLogs, limit);

    res.send(logs);
  } catch(e) {
    res.status(400).send('Something went wrong');
  }
};
