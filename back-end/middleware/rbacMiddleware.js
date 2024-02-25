const Permissions = require('../models/authorization/permission');
const authenticateUser = require('../middleware/authenticateUser');

// Check if the user has the required permission for a route
exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    const userData = await authenticateUser(req, res);
    if (!userData.userId){
      return res.status(403).json({ msg: userData.error });
    }
    const userRole = userData.role;
    const userPermissions = new Permissions().getPermissionsByRoleName(userRole);
    if (userPermissions.includes(permission)) {
      return next();
    } else {
      return res.status(403).json({ msg: 'Access denied' });
    }
  };
};