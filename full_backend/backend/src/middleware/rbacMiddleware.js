const ROLE_PERMISSIONS = {
  admin: [
    "create_sprint", "edit_sprint", "delete_sprint",
    "create_task", "edit_task", "delete_task",
    "create_bug", "edit_bug", "delete_bug",
    "manage_users", "manage_roles",
    "view_analytics", "create_automation",
    "manage_releases", "archive_project"
  ],
  manager: [
    "create_sprint", "edit_sprint",
    "create_task", "edit_task",
    "create_bug", "edit_bug",
    "view_analytics", "create_automation",
    "manage_releases"
  ],
  developer: [
    "create_task", "edit_task",
    "create_bug",
    "view_analytics"
  ],
  qa: [
    "create_bug", "edit_bug",
    "view_analytics"
  ],
  viewer: [
    "view_analytics"
  ]
};

export const checkPermission = (permission) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userPermissions = ROLE_PERMISSIONS[user.role] || [];

      if (!userPermissions.includes(permission)) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
};

export const checkRole = (...roles) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
};

export const getPermissionsForRole = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};
