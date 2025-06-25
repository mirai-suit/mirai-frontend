import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  Organization,
  OrganizationRole,
  OrganizationPermissions,
  getPermissionsForRole,
} from "@/types/organization";

interface OrgState {
  // Current organization context
  currentOrgId: string | null;
  currentOrg: Organization | null;
  currentUserRole: OrganizationRole | null;

  // Organizations list
  organizations: Organization[];

  // Actions
  setCurrentOrg: (org: Organization | null) => void;
  setCurrentOrgId: (orgId: string | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
  updateOrganization: (orgId: string, updates: Partial<Organization>) => void;

  // Permission helpers
  hasPermission: (permission: keyof OrganizationPermissions) => boolean;
  canCreateBoards: () => boolean;
  canInviteUsers: () => boolean;
  canRemoveUsers: () => boolean;
  canChangeRoles: () => boolean;
  isAdmin: () => boolean;
  isEditorOrAdmin: () => boolean;
}

export const useOrgStore = create<OrgState>()(
  devtools(
    (set, get) => ({
      // State
      currentOrgId: null,
      currentOrg: null,
      currentUserRole: null,
      organizations: [],

      // Actions
      setCurrentOrg: (org) =>
        set({
          currentOrg: org,
          currentOrgId: org?.id || null,
          currentUserRole: org?.role || null,
        }),

      setCurrentOrgId: (orgId) => {
        const { organizations } = get();
        const org = organizations.find((o) => o.id === orgId) || null;

        set({
          currentOrgId: orgId,
          currentOrg: org,
          currentUserRole: org?.role || null,
        });
      },

      setOrganizations: (orgs) => set({ organizations: orgs }),

      updateOrganization: (orgId, updates) =>
        set((state) => ({
          organizations: state.organizations.map((org) =>
            org.id === orgId ? { ...org, ...updates } : org
          ),
          currentOrg:
            state.currentOrg?.id === orgId
              ? { ...state.currentOrg, ...updates }
              : state.currentOrg,
        })),

      // Permission helpers
      hasPermission: (permission) => {
        const { currentUserRole } = get();

        if (!currentUserRole) return false;

        return getPermissionsForRole(currentUserRole)[permission];
      },

      canCreateBoards: () => get().hasPermission("createBoards"),
      canInviteUsers: () => get().hasPermission("inviteUsers"),
      canRemoveUsers: () => get().hasPermission("removeUsers"),
      canChangeRoles: () => get().hasPermission("changeUserRoles"),

      isAdmin: () => get().currentUserRole === OrganizationRole.ADMIN,
      isEditorOrAdmin: () => {
        const role = get().currentUserRole;

        return (
          role === OrganizationRole.ADMIN || role === OrganizationRole.EDITOR
        );
      },
    }),
    {
      name: "org-store",
    }
  )
);
