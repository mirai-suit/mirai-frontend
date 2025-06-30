import { addToast } from "@heroui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/libs/axios/interceptor";

export const useBoardAccessList = (organizationId: string, boardId: string) => {
  return useQuery({
    queryKey: ["boardAccess", organizationId, boardId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/board/${boardId}/organization/${organizationId}/access`,
      );

      return data;
    },
    enabled: !!organizationId && !!boardId,
  });
};

type MutationCallbacks = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response?.data?.message === "string"
  ) {
    return (error as any).response.data.message;
  }

  return "Failed to update access.";
}

export const useGrantBoardAccess = (options: MutationCallbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      boardId,
      userId,
      accessRole,
    }: {
      organizationId: string;
      boardId: string;
      userId: string;
      accessRole: string;
    }) => {
      await apiClient.post(
        `/board/${boardId}/organization/${organizationId}/access`,
        { userId, accessRole },
      );
    },
    onSuccess: (_data, { organizationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["orgBoardAccess", organizationId],
        refetchType: "active",
      });
      if (options.onSuccess) {
        options.onSuccess();
      } else {
        addToast({
          title: "Access Updated",
          description: "Board access updated successfully!",
          color: "success",
        });
      }
    },
    onError: (error) => {
      if (options.onError) {
        options.onError(error);
      } else {
        addToast({
          title: "Error",
          description: getErrorMessage(error),
          color: "danger",
        });
      }
    },
  });
};

export const useChangeBoardRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      boardId,
      userId,
      accessRole,
    }: {
      organizationId: string;
      boardId: string;
      userId: string;
      accessRole: string;
    }) => {
      await apiClient.put(
        `/board/${boardId}/organization/${organizationId}/access/${userId}`,
        { accessRole },
      );
    },
    onSuccess: (_data, { organizationId, boardId }) => {
      queryClient.invalidateQueries({
        queryKey: ["boardAccess", organizationId, boardId],
      });
    },
  });
};

export const useRevokeBoardAccess = (options: MutationCallbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      boardId,
      userId,
    }: {
      organizationId: string;
      boardId: string;
      userId: string;
    }) => {
      await apiClient.delete(
        `/board/${boardId}/organization/${organizationId}/access/${userId}`,
      );
    },
    onSuccess: (_data, { organizationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["orgBoardAccess", organizationId],
        refetchType: "active",
      });
      if (options.onSuccess) {
        options.onSuccess();
      } else {
        addToast({
          title: "Access Updated",
          description: "Board access updated successfully!",
          color: "success",
        });
      }
    },
    onError: (error) => {
      if (options.onError) {
        options.onError(error);
      } else {
        addToast({
          title: "Error",
          description: getErrorMessage(error),
          color: "danger",
        });
      }
    },
  });
};
