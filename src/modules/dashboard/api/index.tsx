import type { Organization } from "../types";
import type { CreateOrganizationInput } from "../validations";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { organizationService } from "../services";
import apiClient from "@/libs/axios/interceptor";
import { deleteNotification, markNotificationAsRead } from "./analytics";

// Query Keys - Centralized for consistency
export const ORGANIZATION_QUERY_KEYS = {
  all: ["organizations"] as const,
  lists: () => [...ORGANIZATION_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...ORGANIZATION_QUERY_KEYS.lists(), filters] as const,
  details: () => [...ORGANIZATION_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...ORGANIZATION_QUERY_KEYS.details(), id] as const,
};

// Fetch organizations list
export const useOrganizations = () => {
  return useQuery<Organization[]>({
    queryKey: ORGANIZATION_QUERY_KEYS.lists(),
    queryFn: organizationService.getOrganizations,
  });
};

// Create organization with cache invalidation (no optimistic updates)
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation<Organization, Error, CreateOrganizationInput>({
    mutationFn: organizationService.createOrganization,

    onSuccess: () => {
      // Invalidate and refetch organizations after successful creation
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.all });

      // Update user data if it contains organization count
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },

    onError: () => {
      // Error is handled by the component using this mutation
    },
  });
};


// 1. Get team performance overview (for dashboard)
export const useTeamPerformanceOverview = (
  teamId: string,
  period: "WEEKLY" | "MONTHLY" | "QUARTERLY" = "MONTHLY"
) => {
  return useQuery({
    queryKey: ["teamPerformanceOverview", teamId, period],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/team/${teamId}/overview`,
        { params: { period } }
      );
      return data.overview;
    },
    enabled: !!teamId,
    staleTime: 0, // Always fetch fresh data for real-time analytics
  });
};

// 2. Get user performance metrics for a team
export const useUserPerformanceMetrics = (
  userId: string,
  teamId: string,
  period: "WEEKLY" | "MONTHLY" | "QUARTERLY" = "MONTHLY"
) => {
  return useQuery({
    queryKey: ["userPerformanceMetrics", userId, teamId, period],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/user/${userId}/team/${teamId}/metrics`,
        { params: { period } }
      );
      return data.metrics;
    },
    enabled: !!userId && !!teamId,
    staleTime: 0, // Always fetch fresh data for real-time analytics
  });
};

// 3. Get full performance report for a team (dashboard analytics)
export const useTeamPerformanceReport = (
  teamId: string,
  period: "WEEKLY" | "MONTHLY" | "QUARTERLY" = "MONTHLY"
) => {
  return useQuery({
    queryKey: ["teamPerformanceReport", teamId, period],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/team/${teamId}/report`,
        { params: { period } }
      );
      return data.report;
    },
    enabled: !!teamId,
    staleTime: 0, // Always fetch fresh data for real-time analytics
  });
};


export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
// Export analytics API
export * from "./analytics";
