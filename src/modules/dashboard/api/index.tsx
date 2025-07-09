import type { Organization } from "../types";
import type { CreateOrganizationInput } from "../validations";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { organizationService } from "../services";

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

// Export analytics API
export * from "./analytics";
