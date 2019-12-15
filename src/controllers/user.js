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


export const updatePermissions = async (req, res) => {
  const { userIdToAuthorize, requesterId, permissions } = req.body;

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
    const currentPermissions = query.map(item => item.permission_id);

    const permissionsToDelete = currentPermissions.filter(id => !permissions.includes(id));
    const permissionsToAdd = permissions.filter(id => !currentPermissions.includes(id));
    const deletions = permissionsToDelete.map(id => deleteUserPermission(userIdToAuthorize, id));
    const insertions = permissionsToAdd.map(id => createUserPermission(userIdToAuthorize, id));

    await Promise.all(deletions);
    await Promise.all(insertions);

    res.send(`Authorization updated for user with tag ${userIdToAuthorize}`);
  } catch(e) {
    res.status(400).send('Something went wrong');
  }
};

export const authorizeUser = async (req, res) => {
  const { userId, permissionId } = req.body;

  try {
    const query = await getUserPermissions(userId);
    const currentPermissions = query.map(item => item.permission_id);

    if (currentPermissions.includes(permissionId)) {
      createUserLog({
        userId,
        permissionId,
        success: true,
      });
      res.send('The treasure has been unlocked.');
      return;
    }

    createUserLog({
      userId,
      permissionId,
      success: false,
    });
    res.status(401).send('Access denied');
  } catch(e) {
    res.status(400).send('Something went wrong');
  }
};

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
