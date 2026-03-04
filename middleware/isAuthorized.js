import { Role } from '../models/roles.js';

// requireRole('Admin','Coordinator')
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const userRole = user.role || user.roleName || '';
    if (allowedRoles.includes(userRole)) return next();

    return res.status(403).json({ error: 'Insufficient role' });
  };
};

// requirePermission('manage:resources') - checks permissions stored in Role model
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    // If user has role name directly, try to load permissions from Role model
    try {
      const roleName = user.role || user.roleName;
      if (!roleName) return res.status(403).json({ error: 'No role assigned' });

      const roleDoc = await Role.findOne({ name: roleName });
      if (!roleDoc) return res.status(403).json({ error: 'Role not found' });

      if (Array.isArray(roleDoc.permissions) && roleDoc.permissions.includes(permission)) {
        return next();
      }

      return res.status(403).json({ error: 'Permission denied' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };
};
