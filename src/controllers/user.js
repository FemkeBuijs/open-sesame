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
  authorisedRolesToUpdatePermissions,
  authorisedRolesForLogs,
} from '../utils/permissions';


/**
 * Update a user's permissions
 * @param req Information regarding the HTTPS request
 * @param res Used to return the desired response
 * @returns {String}
 */
export const updatePermissions = async (req, res) => {
  const { userIdToAuthorise, requesterId, permissions } = req.body;

  // Check if the required parameters are present
  if (!requesterId || !userIdToAuthorise || !permissions) {
    res.status(400).send('Missing required parameters, please check your request');
    return;
  }

  // Check if the requester is trying to update its own permissions
  if ( userIdToAuthorise === requesterId ) {
    res.status(403).send('You\'re not allowed to update your own permissions you cheeky little monkey');
    return;
  }

  try {
    // Check if the requester is allowed to update permissions
    const roles = await getUserRole(requesterId);
    const intersection = roles.filter(role => authorisedRolesToUpdatePermissions.includes(role.name));

    if (!intersection.length) {
      res.status(403).send('You\'re not cool enough to update permissions. Maybe try to get a promotion first.');
      return;
    }

    // Check if user to update permissions for exists
    const user = await getUser(userIdToAuthorise, 'id');

    if (!user.length) {
      res.status(400).send('No user found with this ID');
      return;
    }

    // Get the current permissions of the user
    const query = await getUserPermissions(userIdToAuthorise);
    const userPermissions = query.map(item => item.permission_id);

    // Check which permissions need to be added and which ones need to be deleted
    const permissionsToDelete = userPermissions.filter(id => !permissions.includes(id));
    const permissionsToAdd = permissions.filter(id => !userPermissions.includes(id));
    const deletions = permissionsToDelete.map(id => deleteUserPermission(userIdToAuthorise, id));
    const insertions = permissionsToAdd.map(id => createUserPermission(userIdToAuthorise, id));

    // Add and delete permissions if present
    await Promise.all(deletions);
    await Promise.all(insertions);

    res.status(200).send(`Authorization updated for user with tag ${userIdToAuthorise}`);
  } catch(e) {
    res.status(400).send('Something went wrong, please check your request or the database connection.');
  }
};

/**
 * Authorise a user
 * @param req Information regarding the HTTPS request
 * @param res Used to return the desired response
 * @returns {Object}
 */
export const authoriseUser = async (req, res) => {
  const { userId, permissionId } = req.body;

  // Check if the required parameters are present
  if (!userId || !permissionId) {
    res.status(400).send('User ID and/or permission ID missing, please check your request');
    return;
  }

  try {
    // Get current user permissions
    const query = await getUserPermissions(userId);
    const userPermissions = query.map(item => item.permission_id);

    // Check if the user's permissions include the requested permission,
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

      res.status(200).send({
        'authorised': true,
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
    res.status(403).send({
      'authorised': false,
      'message': 'Access Denied'
    });
  } catch(e) {
    res.status(400).send('Something went wrong, please check your request or the database connection.');
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

  // Check if the required parameter is present
  if (!requesterId) {
    res.status(400).send('Requester ID missing, please check your request');
    return;
  }

  try {
    // Check if the user is allowed to request logs
    const roles = await getUserRole(requesterId, limit);
    const intersection = roles.filter(role => authorisedRolesForLogs.includes(role.name));

    if (!intersection.length && requesterId !== userIdForLogs) {
      res.status(403).send('Nope, no logs for you!');
      return;
    }

    const logs = await getUserLogs(userIdForLogs, limit);

    res.send(logs);
  } catch(e) {
    res.status(400).send('Something went wrong, please check your request or the database connection.');
  }
};
