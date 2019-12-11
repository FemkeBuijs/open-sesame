import {
  getUserRole,
  getUserPermissions,
  createUserPermission,
  deleteUserPermission,
} from '../models/user';


export const updatePermissions = async (req, res) => {
  const { userToAuthorize, currentUser, permissions } = req.body;
  const permittedRoles = ['admin'];
  if ( userToAuthorize === currentUser ) {
    res.send('You\'re not allowed to update your own permissions you cheeky little monkey');
    return;
  }

  try {
    // Check if the user is allowed to update permissions
    const roles = await getUserRole(currentUser);
    const intersection = roles.filter(role => permittedRoles.includes(role.name));

    if (!intersection.length) {
      res.send('You\'re not cool enough to update permissions. Maybe try to get a promotion first.');
      return;
    }

    const query = await getUserPermissions(userToAuthorize);
    const currentPermissions = query.map(item => item.permission_id);

    const permissionsToDelete = currentPermissions.filter(id => !permissions.includes(id));
    const permissionsToAdd = permissions.filter(id => !currentPermissions.includes(id));
    const deletions = permissionsToDelete.map(id => deleteUserPermission(userToAuthorize, id));
    const insertions = permissionsToAdd.map(id => createUserPermission(userToAuthorize, id));

    await Promise.all(deletions);
    await Promise.all(insertions);

    res.send(`Authorization updated for user with tag ${userToAuthorize}`);
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
      res.send('The treasure has been unlocked.');
      return;
    }

    res.status(401).send('Access denied');
  } catch(e) {
    res.status(400).send('Something went wrong');
  }
};
