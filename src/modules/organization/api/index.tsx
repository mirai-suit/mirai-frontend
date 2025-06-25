import type {
  GetMembersResponse,
  GetInvitationsResponse,
  SendInvitationResponse,
  SendInvitationInput,
  GetInvitationDetailsResponse,
  AcceptInvitationResponse,
} from "../types";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToast } from "@heroui/react";

import { organizationMembersService, invitationService } from "../services";

// Query Keys
export const organizationKeys = {
  all: ["organization"] as const,
  members: (orgId: string) =>
    [...organizationKeys.all, "members", orgId] as const,
  invitations: (orgId: string) =>
    [...organizationKeys.all, "invitations", orgId] as const,
  invitation: (token: string) =>
    [...organizationKeys.all, "invitation", token] as const,
};

// ===== ORGANIZATION MEMBERS =====

// Get organization members
export const useOrganizationMembers = (organizationId: string) => {
  return useQuery<GetMembersResponse>({
    queryKey: organizationKeys.members(organizationId),
    queryFn: () => organizationMembersService.getMembers(organizationId),
    enabled: !!organizationId,
  });
};

// Remove member from organization
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { organizationId: string; userId: string }>({
    mutationFn: ({ organizationId, userId }) =>
      organizationMembersService.removeMember(organizationId, userId),
    onSuccess: (_, { organizationId }) => {
      // Invalidate members list
      queryClient.invalidateQueries({
        queryKey: organizationKeys.members(organizationId),
      });

      addToast({
        title: "Member Removed",
        description:
          "Member has been removed from the organization successfully!",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Remove Failed",
        description: "Failed to remove member. Please try again.",
        color: "danger",
      });
    },
  });
};

// Change member role
export const useChangeMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { organizationId: string; userId: string; role: string }
  >({
    mutationFn: ({ organizationId, userId, role }) =>
      organizationMembersService.changeMemberRole(organizationId, userId, role),
    onSuccess: (_, { organizationId }) => {
      // Invalidate members list
      queryClient.invalidateQueries({
        queryKey: organizationKeys.members(organizationId),
      });

      addToast({
        title: "Role Updated",
        description: "Member role has been updated successfully!",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Update Failed",
        description: "Failed to update member role. Please try again.",
        color: "danger",
      });
    },
  });
};

// ===== INVITATIONS =====

// Get organization invitations
export const useOrganizationInvitations = (organizationId: string) => {
  return useQuery<GetInvitationsResponse>({
    queryKey: organizationKeys.invitations(organizationId),
    queryFn: () => invitationService.getInvitations(organizationId),
    enabled: !!organizationId,
  });
};

// Send invitation
export const useSendInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SendInvitationResponse,
    Error,
    { organizationId: string } & SendInvitationInput
  >({
    mutationFn: ({ organizationId, email, role }) =>
      invitationService.sendInvitation(organizationId, { email, role }),
    onSuccess: (_, { organizationId }) => {
      // Invalidate invitations list
      queryClient.invalidateQueries({
        queryKey: organizationKeys.invitations(organizationId),
      });

      addToast({
        title: "Invitation Sent",
        description: "Invitation has been sent successfully!",
        color: "success",
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Failed to send invitation. Please try again.";

      addToast({
        title: "Invitation Failed",
        description: message,
        color: "danger",
      });
    },
  });
};

// Revoke invitation
export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { organizationId: string; invitationId: string }
  >({
    mutationFn: ({ organizationId, invitationId }) =>
      invitationService.revokeInvitation(organizationId, invitationId),
    onSuccess: (_, { organizationId }) => {
      // Invalidate invitations list
      queryClient.invalidateQueries({
        queryKey: organizationKeys.invitations(organizationId),
      });

      addToast({
        title: "Invitation Revoked",
        description: "Invitation has been revoked successfully!",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Revoke Failed",
        description: "Failed to revoke invitation. Please try again.",
        color: "danger",
      });
    },
  });
};

// ===== PUBLIC INVITATION ENDPOINTS =====

// Get invitation details (public)
export const useInvitationDetails = (token: string) => {
  return useQuery<GetInvitationDetailsResponse>({
    queryKey: organizationKeys.invitation(token),
    queryFn: () => invitationService.getInvitationDetails(token),
    enabled: !!token,
    retry: false, // Don't retry if token is invalid
  });
};

// Accept invitation (public)
export const useAcceptInvitation = () => {
  return useMutation<AcceptInvitationResponse, Error, string>({
    mutationFn: (token) => invitationService.acceptInvitation(token),
    onSuccess: (data) => {
      addToast({
        title: "Invitation Accepted",
        description: `Welcome to ${data.organization.name}!`,
        color: "success",
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Failed to accept invitation. Please try again.";

      addToast({
        title: "Accept Failed",
        description: message,
        color: "danger",
      });
    },
  });
};
