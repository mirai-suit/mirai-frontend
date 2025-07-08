import type {
  CreateBoardResponse,
  GetBoardResponse,
  GetBoardsResponse,
  UpdateBoardResponse,
  DeleteBoardResponse,
  BoardAccessResponse,
} from "../types";
import type {
  CreateBoardInput,
  UpdateBoardInput,
  BoardAccessInput,
} from "../validations";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { addToast } from "@heroui/react";

import { boardService } from "../services";

// Query Keys
export const boardKeys = {
  all: ["boards"] as const,
  lists: () => [...boardKeys.all, "list"] as const,
  list: (organizationId: string) =>
    [...boardKeys.lists(), organizationId] as const,
  details: () => [...boardKeys.all, "detail"] as const,
  detail: (boardId: string) => [...boardKeys.details(), boardId] as const,
};

// Get boards for organization
export const useBoards = (
  organizationId: string,
  options?: UseQueryOptions<GetBoardsResponse>,
) => {
  return useQuery({
    queryKey: boardKeys.list(organizationId),
    queryFn: () => boardService.getBoardsForOrganization(organizationId),
    enabled: !!organizationId,
    ...options,
  });
};

// Get single board
export const useBoard = (
  boardId: string,
  options?: UseQueryOptions<GetBoardResponse>,
) => {
  return useQuery({
    queryKey: boardKeys.detail(boardId),
    queryFn: () => boardService.getBoardById(boardId),
    enabled: !!boardId,
    ...options,
  });
};

// Create board mutation
export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateBoardResponse, Error, CreateBoardInput>({
    mutationFn: boardService.createBoard,
    onSuccess: (data, variables) => {
      // Invalidate and refetch boards list
      queryClient.invalidateQueries({
        queryKey: boardKeys.list(variables.organizationId),
      });

      // Add the new board to the cache
      queryClient.setQueryData(boardKeys.detail(data.board.id), () => ({
        success: true,
        board: data.board,
      }));

      // Show success toast
      addToast({
        title: "Board Created",
        description: `"${data.board.title}" has been created successfully!`,
        color: "success",
      });
    },
    onError: (_error) => {
      // Show error toast
      addToast({
        title: "Creation Failed",
        description: "Failed to create board. Please try again.",
        color: "danger",
      });
    },
  });
};

// Update board mutation
export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateBoardResponse,
    Error,
    { boardId: string; updateData: UpdateBoardInput }
  >({
    mutationFn: ({ boardId, updateData }) =>
      boardService.updateBoard(boardId, updateData),
    onSuccess: (data, { boardId }) => {
      // Update the specific board in cache
      queryClient.setQueryData(boardKeys.detail(boardId), () => ({
        success: true,
        board: data.board,
      }));

      // Invalidate boards list to reflect changes
      queryClient.invalidateQueries({
        queryKey: boardKeys.lists(),
      });

      // Show success toast
      addToast({
        title: "Board Updated",
        description: `"${data.board.title}" has been updated successfully!`,
        color: "success",
      });
    },
    onError: (_error) => {
      // Show error toast
      addToast({
        title: "Update Failed",
        description: "Failed to update board. Please try again.",
        color: "danger",
      });
    },
  });
};

// Delete board mutation
export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteBoardResponse, Error, string>({
    mutationFn: boardService.deleteBoard,
    onSuccess: (data, boardId) => {
      // Remove board from cache
      queryClient.removeQueries({
        queryKey: boardKeys.detail(boardId),
      });

      // Invalidate boards list
      queryClient.invalidateQueries({
        queryKey: boardKeys.lists(),
      });

      // Show success toast
      addToast({
        title: "Board Moved to Trash",
        description: `"${data.board.title}" has been moved to trash successfully!`,
        color: "success",
      });
    },
    onError: (_error) => {
      // Show error toast
      addToast({
        title: "Delete Failed",
        description: "Failed to move board to trash. Please try again.",
        color: "danger",
      });
    },
  });
};

// Add user to board mutation
export const useAddUserToBoard = () => {
  const queryClient = useQueryClient();

  return useMutation<
    BoardAccessResponse,
    Error,
    { boardId: string; accessData: BoardAccessInput }
  >({
    mutationFn: ({ boardId, accessData }) =>
      boardService.addUserToBoard(boardId, accessData),
    onSuccess: (_, { boardId }) => {
      // Invalidate board details to refetch with new access list
      queryClient.invalidateQueries({
        queryKey: boardKeys.detail(boardId),
      });

      // Show success toast
      addToast({
        title: "User Added",
        description: "User has been added to the board successfully!",
        color: "success",
      });
    },
    onError: (_error) => {
      // Show error toast
      addToast({
        title: "Add User Failed",
        description: "Failed to add user to board. Please try again.",
        color: "danger",
      });
    },
  });
};

// Remove user from board mutation
export const useRemoveUserFromBoard = () => {
  const queryClient = useQueryClient();

  return useMutation<
    BoardAccessResponse,
    Error,
    { boardId: string; userId: string }
  >({
    mutationFn: ({ boardId, userId }) =>
      boardService.removeUserFromBoard(boardId, userId),
    onSuccess: (_, { boardId }) => {
      // Invalidate board details to refetch with updated access list
      queryClient.invalidateQueries({
        queryKey: boardKeys.detail(boardId),
      });

      // Show success toast
      addToast({
        title: "User Removed",
        description: "User has been removed from the board successfully!",
        color: "success",
      });
    },
    onError: (_error) => {
      // Show error toast
      addToast({
        title: "Remove User Failed",
        description: "Failed to remove user from board. Please try again.",
        color: "danger",
      });
    },
  });
};

// Change user board role mutation
export const useChangeUserBoardRole = () => {
  const queryClient = useQueryClient();

  return useMutation<
    BoardAccessResponse,
    Error,
    { boardId: string; userId: string; accessRole: string }
  >({
    mutationFn: ({ boardId, userId, accessRole }) =>
      boardService.changeUserBoardRole(boardId, userId, accessRole),
    onSuccess: (_, { boardId }) => {
      // Invalidate board details to refetch with updated access list
      queryClient.invalidateQueries({
        queryKey: boardKeys.detail(boardId),
      });

      // Show success toast
      addToast({
        title: "Role Updated",
        description: "User role has been updated successfully!",
        color: "success",
      });
    },
    onError: (_error) => {
      // Show error toast
      addToast({
        title: "Role Update Failed",
        description: "Failed to update user role. Please try again.",
        color: "danger",
      });
    },
  });
};

// Archive board mutation
export const useArchiveBoard = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateBoardResponse,
    Error,
    { boardId: string; isArchived: boolean }
  >({
    mutationFn: ({ boardId, isArchived }) =>
      boardService.updateBoard(boardId, { isArchived }),
    onSuccess: (data, { boardId, isArchived }) => {
      // Update the specific board in cache
      queryClient.setQueryData(boardKeys.detail(boardId), () => ({
        success: true,
        board: data.board,
      }));

      // Invalidate boards list to reflect changes
      queryClient.invalidateQueries({
        queryKey: boardKeys.lists(),
      });

      // Show success toast
      const action = isArchived ? "archived" : "unarchived";

      addToast({
        title: `Board ${isArchived ? "Archived" : "Unarchived"}`,
        description: `"${data.board.title}" has been ${action} successfully!`,
        color: "success",
      });
    },
    onError: (_error, { isArchived }) => {
      // Show error toast
      const action = isArchived ? "archive" : "unarchive";

      addToast({
        title: `${isArchived ? "Archive" : "Unarchive"} Failed`,
        description: `Failed to ${action} board. Please try again.`,
        color: "danger",
      });
    },
  });
};
