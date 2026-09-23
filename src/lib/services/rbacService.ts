import api from '../api';

export type PermissionMap = Record<string, boolean>;
export interface AccessData { permissions: PermissionMap; branchIds: string[]; activeBranch: string; isSuperAdmin: boolean; }
export interface RoleDefinition { id: string; name: string; permissions: PermissionMap; predefined: boolean; }
export interface RbacCatalog { modules: Record<string, string>; actions: string[]; moduleActions: Record<string, string[]>; pricePermissions: Record<string, string>; roles: RoleDefinition[]; branches: { branchId: string; name: string }[]; }

export const rbacService = {
  getAccess: (): Promise<{ success: boolean; data: AccessData }> => api.get('/rbac/access'),
  getCatalog: (): Promise<{ success: boolean; data: RbacCatalog }> => api.get('/rbac/catalog'),
  getAudit: (page = 1) => api.get(`/rbac/audit?page=${page}`),
};
