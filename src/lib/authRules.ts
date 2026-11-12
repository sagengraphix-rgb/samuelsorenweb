/**
 * Role-Based Access Control (RBAC) rules for Pastor Samuel Soren Admin Dashboard.
 */

export type UserRole = 'superadmin' | 'editor' | 'public';

export type ProtectedResource =
  | 'blogs'
  | 'ministries'
  | 'products'
  | 'orders'
  | 'contacts'
  | 'subscribers'
  | 'settings'
  | 'users';

const ROLE_PERMISSIONS: Record<UserRole, ProtectedResource[]> = {
  superadmin: [
    'blogs',
    'ministries',
    'products',
    'orders',
    'contacts',
    'subscribers',
    'settings',
    'users'
  ],
  editor: [
    'blogs',
    'ministries'
  ],
  public: []
};

/**
 * Checks whether a given role can perform operations on a protected resource.
 * Crucial Security Rule:
 * Editors MUST NEVER access private contact messages, prayer requests, financial orders, or site settings.
 */
export function hasPermission(role: UserRole | undefined, resource: ProtectedResource): boolean {
  if (!role) return false;
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(resource);
}

export function isContactAccessAllowed(role: UserRole | undefined): boolean {
  return role === 'superadmin';
}
