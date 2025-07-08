import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToast } from "@heroui/react";
import {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  TeamsListResponse,
} from "../types/team";
import apiClient from "@/libs/axios/interceptor";

// API endpoints
const TEAM_ENDPOINTS = {
  create: "/team",
  getByOrg: (orgId: string) => `/team/organization/${orgId}`,
  getById: (teamId: string) => `/team/${teamId}`,
  update: (teamId: string) => `/team/${teamId}`,
  delete: (teamId: string) => `/team/${teamId}`,
  addMembers: (teamId: string) => `/team/${teamId}/members`,
  removeMember: (teamId: string, userId: string) =>
    `/team/${teamId}/members/${userId}`,
  updateMemberRole: (teamId: string, userId: string) =>
    `/team/${teamId}/members/${userId}/role`,
  assignBoards: (teamId: string) => `/team/${teamId}/boards`,
  removeBoard: (teamId: string, boardId: string) =>
    `/team/${teamId}/boards/${boardId}`,
  getUserTeams: (userId: string) => `/team/user/${userId}`,
  getPerformance: (teamId: string) => `/team/${teamId}/performance`,
};

// Query keys
export const TEAM_QUERY_KEYS = {
  all: ["teams"] as const,
  lists: () => [...TEAM_QUERY_KEYS.all, "list"] as const,
  list: (orgId: string) => [...TEAM_QUERY_KEYS.lists(), orgId] as const,
  details: () => [...TEAM_QUERY_KEYS.all, "detail"] as const,
  detail: (teamId: string) => [...TEAM_QUERY_KEYS.details(), teamId] as const,
  userTeams: (userId: string) =>
    [...TEAM_QUERY_KEYS.all, "user", userId] as const,
  performance: (teamId: string) =>
    [...TEAM_QUERY_KEYS.all, "performance", teamId] as const,
};

// Get teams by organization
export const useTeams = (organizationId: string) => {
  return useQuery({
    queryKey: TEAM_QUERY_KEYS.list(organizationId),
    queryFn: async (): Promise<TeamsListResponse> => {
      const response = await apiClient.get(
        TEAM_ENDPOINTS.getByOrg(organizationId)
      );
      return response.data.data; // Backend returns { success: true, data: result }
    },
    enabled: !!organizationId,
  });
};

// Get team by ID
export const useTeam = (teamId: string) => {
  return useQuery({
    queryKey: TEAM_QUERY_KEYS.detail(teamId),
    queryFn: async (): Promise<Team> => {
      const response = await apiClient.get(TEAM_ENDPOINTS.getById(teamId));
      return response.data.data.team; // Backend returns { success: true, data: { team } }
    },
    enabled: !!teamId,
  });
};

// Get user teams
export const useUserTeams = (userId: string) => {
  return useQuery({
    queryKey: TEAM_QUERY_KEYS.userTeams(userId),
    queryFn: async (): Promise<Team[]> => {
      const response = await apiClient.get(TEAM_ENDPOINTS.getUserTeams(userId));
      return response.data.teams;
    },
    enabled: !!userId,
  });
};

// Create team
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTeamRequest): Promise<Team> => {
      const response = await apiClient.post(TEAM_ENDPOINTS.create, data);
      return response.data.data.team; // Backend returns { success: true, data: { team } }
    },
    onSuccess: (team) => {
      // Invalidate and refetch teams list
      queryClient.invalidateQueries({
        queryKey: TEAM_QUERY_KEYS.list(team.organization.id),
      });
      // Add team to cache
      queryClient.setQueryData(TEAM_QUERY_KEYS.detail(team.id), team);

      // Show success toast
      addToast({
        title: "Team Created",
        description: `"${team.name}" has been created successfully!`,
        color: "success",
      });
    },
    onError: (error: any) => {
      // Show error toast
      addToast({
        title: "Creation Failed",
        description:
          error?.response?.data?.message ||
          "Failed to create team. Please try again.",
        color: "danger",
      });
    },
  });
};

// Update team
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      data,
    }: {
      teamId: string;
      data: UpdateTeamRequest;
    }): Promise<Team> => {
      const response = await apiClient.put(TEAM_ENDPOINTS.update(teamId), data);
      return response.data.data.team; // Backend returns { success: true, data: { team } }
    },
    onSuccess: (team) => {
      // Update team in cache
      queryClient.setQueryData(TEAM_QUERY_KEYS.detail(team.id), team);
      // Invalidate teams list
      queryClient.invalidateQueries({
        queryKey: TEAM_QUERY_KEYS.list(team.organization.id),
      });

      // Show success toast
      addToast({
        title: "Team Updated",
        description: `"${team.name}" has been updated successfully!`,
        color: "success",
      });
    },
    onError: (error: any) => {
      // Show error toast
      addToast({
        title: "Update Failed",
        description:
          error?.response?.data?.message ||
          "Failed to update team. Please try again.",
        color: "danger",
      });
    },
  });
};

// Delete team
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: string): Promise<void> => {
      await apiClient.delete(TEAM_ENDPOINTS.delete(teamId));
    },
    onSuccess: (_, teamId) => {
      // Remove team from cache
      queryClient.removeQueries({
        queryKey: TEAM_QUERY_KEYS.detail(teamId),
      });
      // Invalidate teams lists
      queryClient.invalidateQueries({
        queryKey: TEAM_QUERY_KEYS.lists(),
      });

      // Show success toast
      addToast({
        title: "Team Deleted",
        description: "Team has been deleted successfully!",
        color: "success",
      });
    },
    onError: (error: any) => {
      // Show error toast
      addToast({
        title: "Deletion Failed",
        description:
          error?.response?.data?.message ||
          "Failed to delete team. Please try again.",
        color: "danger",
      });
    },
  });
};

// Add team members
export const useAddTeamMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      memberIds,
      role,
    }: {
      teamId: string;
      memberIds: string[];
      role?: "MEMBER" | "LEADER";
    }) => {
      const response = await apiClient.post(TEAM_ENDPOINTS.addMembers(teamId), {
        memberIds,
        role: role || "MEMBER",
      });
      return response.data.members;
    },
    onSuccess: (_, { teamId }) => {
      // Invalidate team details to refetch with new members
      queryClient.invalidateQueries({
        queryKey: TEAM_QUERY_KEYS.detail(teamId),
      });

      // Show success toast
      addToast({
        title: "Members Added",
        description: "Team members have been added successfully!",
        color: "success",
      });
    },
    onError: (error: any) => {
      // Show error toast
      addToast({
        title: "Failed to Add Members",
        description:
          error?.response?.data?.message ||
          "Failed to add team members. Please try again.",
        color: "danger",
      });
    },
  });
};

// Remove team member
export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      userId,
    }: {
      teamId: string;
      userId: string;
    }) => {
      await apiClient.delete(TEAM_ENDPOINTS.removeMember(teamId, userId));
    },
    onSuccess: (_, { teamId }) => {
      // Invalidate team details to refetch without removed member
      queryClient.invalidateQueries({
        queryKey: TEAM_QUERY_KEYS.detail(teamId),
      });

      // Show success toast
      addToast({
        title: "Member Removed",
        description: "Team member has been removed successfully!",
        color: "success",
      });
    },
    onError: (error: any) => {
      // Show error toast
      addToast({
        title: "Failed to Remove Member",
        description:
          error?.response?.data?.message ||
          "Failed to remove team member. Please try again.",
        color: "danger",
      });
    },
  });
};

// Update team member role
export const useUpdateTeamMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      userId,
      role,
    }: {
      teamId: string;
      userId: string;
      role: "MEMBER" | "LEADER";
    }) => {
      const response = await apiClient.put(
        TEAM_ENDPOINTS.updateMemberRole(teamId, userId),
        { role }
      );
      return response.data.member;
    },
    onSuccess: (_, { teamId }) => {
      // Invalidate team details to refetch with updated roles
      queryClient.invalidateQueries({
        queryKey: TEAM_QUERY_KEYS.detail(teamId),
      });

      // Show success toast
      addToast({
        title: "Role Updated",
        description: "Team member role has been updated successfully!",
        color: "success",
      });
    },
    onError: (error: any) => {
      // Show error toast
      addToast({
        title: "Failed to Update Role",
        description:
          error?.response?.data?.message ||
          "Failed to update member role. Please try again.",
        color: "danger",
      });
    },
  });
};

// Assign boards to team
export const useAssignBoards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      boardIds,
      grantedBy,
    }: {
      teamId: string;
      boardIds: string[];
      grantedBy: string;
    }) => {
      await apiClient.post(TEAM_ENDPOINTS.assignBoards(teamId), {
        boardIds,
        grantedBy,
      });
    },
    onSuccess: (_, { teamId }) => {
      // Invalidate team details to refetch with new board access
      queryClient.invalidateQueries({
        queryKey: TEAM_QUERY_KEYS.detail(teamId),
      });

      // Show success toast
      addToast({
        title: "Boards Assigned",
        description: "Boards have been assigned to the team successfully!",
        color: "success",
      });
    },
    onError: (error: any) => {
      // Show error toast
      addToast({
        title: "Failed to Assign Boards",
        description:
          error?.response?.data?.message ||
          "Failed to assign boards. Please try again.",
        color: "danger",
      });
    },
  });
};

// Remove board from team
export const useRemoveBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      boardId,
    }: {
      teamId: string;
      boardId: string;
    }) => {
      await apiClient.delete(TEAM_ENDPOINTS.removeBoard(teamId, boardId));
    },
    onSuccess: (_, { teamId }) => {
      // Invalidate team details to refetch without removed board
      queryClient.invalidateQueries({
        queryKey: TEAM_QUERY_KEYS.detail(teamId),
      });

      // Show success toast
      addToast({
        title: "Board Removed",
        description: "Board has been removed from the team successfully!",
        color: "success",
      });
    },
    onError: (error: any) => {
      // Show error toast
      addToast({
        title: "Failed to Remove Board",
        description:
          error?.response?.data?.message ||
          "Failed to remove board. Please try again.",
        color: "danger",
      });
    },
  });
};

// Get team performance
export const useTeamPerformance = (teamId: string) => {
  return useQuery({
    queryKey: TEAM_QUERY_KEYS.performance(teamId),
    queryFn: async () => {
      const response = await apiClient.get(
        TEAM_ENDPOINTS.getPerformance(teamId)
      );
      return response.data;
    },
    enabled: !!teamId,
  });
};
