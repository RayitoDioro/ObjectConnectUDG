export const PERMISSIONS = {
  // Admin - Usuarios
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',

  // Admin - Roles
  VIEW_ROLES: 'view_roles',
  CREATE_ROLES: 'create_roles',
  EDIT_ROLES: 'edit_roles',
  DELETE_ROLES: 'delete_roles',

  // Admin - Permisos
  VIEW_PERMISSIONS: 'view_permissions',
  CREATE_PERMISSIONS: 'create_permissions',
  EDIT_PERMISSIONS: 'edit_permissions',
  DELETE_PERMISSIONS: 'delete_permissions',

  // Admin - Categorías
  VIEW_CATEGORIES: 'view_categories',
  CREATE_CATEGORIES: 'create_categories',
  EDIT_CATEGORIES: 'edit_categories',
  DELETE_CATEGORIES: 'delete_categories',

  // Admin - Posts
  VIEW_POSTS_ADMIN: 'view_posts_admin',
  MODERATE_POSTS: 'moderate_posts',
  DELETE_POSTS_ADMIN: 'delete_posts_admin',

  // Admin - ML (futuro)
  VIEW_ML_MODULE: 'view_ml_module',

  // Moderador
  MODERATE_USERS: 'moderate_users',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];