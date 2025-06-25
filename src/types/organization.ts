// Organization Role Enum - matching backend
export enum OrganizationRole {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  MEMBER = "MEMBER",
}

// Organization Permissions Interface
export interface OrganizationPermissions {
  // User Management
  inviteUsers: boolean;
  removeUsers: boolean;
  changeUserRoles: boolean;

  // Board Management
  createBoards: boolean;
  deleteBoards: boolean;
  archiveBoards: boolean;

  // Organization Settings
  updateOrgSettings: boolean;
  deleteOrganization: boolean;

  // Board Access
  accessAllBoards: boolean;
}

// Organization Member
export interface OrganizationMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: OrganizationRole;
  joinedAt: string;
}

// Organization Details
export interface Organization {
  id: string;
  name: string;
  role: OrganizationRole; // Current user's role in this org
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  boardCount: number;
  isCreator: boolean;
}

// Organization with Members (detailed view)
export interface OrganizationDetails extends Omit<Organization, "memberCount"> {
  members: OrganizationMember[];
  userRole: OrganizationRole;
}

// Role Permission Mapping
export const ROLE_PERMISSIONS: Record<
  OrganizationRole,
  OrganizationPermissions
> = {
  [OrganizationRole.ADMIN]: {
    inviteUsers: true,
    removeUsers: true,
    changeUserRoles: true,
    createBoards: true,
    deleteBoards: true,
    archiveBoards: true,
    updateOrgSettings: true,
    deleteOrganization: true,
    accessAllBoards: true,
  },
  [OrganizationRole.EDITOR]: {
    inviteUsers: true,
    removeUsers: false,
    changeUserRoles: false,
    createBoards: true,
    deleteBoards: false,
    archiveBoards: true,
    updateOrgSettings: false,
    deleteOrganization: false,
    accessAllBoards: false,
  },
  [OrganizationRole.MEMBER]: {
    inviteUsers: false,
    removeUsers: false,
    changeUserRoles: false,
    createBoards: false,
    deleteBoards: false,
    archiveBoards: false,
    updateOrgSettings: false,
    deleteOrganization: false,
    accessAllBoards: false,
  },
};

// Helper functions
export function getPermissionsForRole(
  role: OrganizationRole,
): OrganizationPermissions {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(
  role: OrganizationRole,
  permission: keyof OrganizationPermissions,
): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

export function canPerformAction(
  userRole: OrganizationRole | undefined,
  requiredPermission: keyof OrganizationPermissions,
): boolean {
  if (!userRole) return false;

  return hasPermission(userRole, requiredPermission);
}
