import type {
  GetMembersResponse,
  GetInvitationsResponse,
  SendInvitationResponse,
  SendInvitationInput,
  GetInvitationDetailsResponse,
  AcceptInvitationResponse,
} from "../types";

import apiClient from "@/libs/axios/interceptor";

// ===== ORGANIZATION MEMBERS SERVICES =====

export const organizationMembersService = {
  // Get organization members
  getMembers: async (organizationId: string): Promise<GetMembersResponse> => {
    const response = await apiClient.get(
      `/organization/${organizationId}/members`
    );

    return response.data;
  },

  // Remove member from organization
  removeMember: async (organizationId: string, userId: string) => {
    const response = await apiClient.delete(
      `/organization/${organizationId}/remove-member`,
      { data: { userId } }
    );

    return response.data;
  },

  // Change member role
  changeMemberRole: async (
    organizationId: string,
    userId: string,
    role: string
  ) => {
    const response = await apiClient.patch(
      `/organization/${organizationId}/change-role`,
      { userId, newRole: role } // Fix: backend expects 'newRole', not 'role'
    );

    return response.data;
  },
};

// ===== INVITATION SERVICES =====

export const invitationService = {
  // Get organization invitations
  getInvitations: async (
    organizationId: string
  ): Promise<GetInvitationsResponse> => {
    const response = await apiClient.get(
      `/organization/${organizationId}/invitations`
    );

    return response.data;
  },

  // Send invitation
  sendInvitation: async (
    organizationId: string,
    invitationData: SendInvitationInput
  ): Promise<SendInvitationResponse> => {
    const response = await apiClient.post(
      `/organization/${organizationId}/invite`,
      invitationData
    );

    return response.data;
  },

  // Revoke invitation
  revokeInvitation: async (organizationId: string, invitationId: string) => {
    const response = await apiClient.delete(
      `/organization/${organizationId}/invitations/${invitationId}`
    );

    return response.data;
  },

  // Get invitation details (public)
  getInvitationDetails: async (
    token: string
  ): Promise<GetInvitationDetailsResponse> => {
    const response = await apiClient.get(`/invitation/${token}`);

    return response.data;
  },

  // Accept invitation (public)
  acceptInvitation: async (
    token: string
  ): Promise<AcceptInvitationResponse> => {
    const response = await apiClient.post(`/invitation/${token}/accept`);

    return response.data;
  },
};
