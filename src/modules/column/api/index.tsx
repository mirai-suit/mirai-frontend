import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToast } from "@heroui/react";

import * as columnService from "../services";
import {
  CreateColumnRequest,
  UpdateColumnRequest,
  ReorderColumnTasksRequest,
  ReorderColumnsRequest,
} from "../types";

// Query keys
export const columnKeys = {
  all: ["columns"] as const,
  board: (boardId: string) => [...columnKeys.all, "board", boardId] as const,
  column: (columnId: string) =>
    [...columnKeys.all, "column", columnId] as const,
};

// Get columns for a board
export const useGetColumnsForBoard = (boardId: string) => {
  return useQuery({
    queryKey: columnKeys.board(boardId),
    queryFn: () => columnService.getColumnsForBoard(boardId),
    enabled: !!boardId,
  });
};

// Create column mutation
export const useCreateColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateColumnRequest) => columnService.createColumn(data),
    onSuccess: (_response, variables) => {
      addToast({
        title: "Success!",
        description: "Column created successfully!",
        color: "success",
        variant: "flat",
      });

      // Invalidate and refetch columns for this board
      queryClient.invalidateQueries({
        queryKey: columnKeys.board(variables.boardId),
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create column";

      addToast({
        title: "Error",
        description: message,
        color: "danger",
        variant: "flat",
      });
    },
  });
};

// Update column mutation
export const useUpdateColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateColumnRequest) => columnService.updateColumn(data),

    onSuccess: () => {
      addToast({
        title: "Success!",
        description: "Column updated successfully!",
        color: "success",
        variant: "flat",
      });

      // Invalidate all columns queries
      queryClient.invalidateQueries({
        queryKey: columnKeys.all,
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to update column";

      addToast({
        title: "Error",
        description: message,
        color: "danger",
        variant: "flat",
      });
    },
  });
};

// Delete column mutation
export const useDeleteColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (columnId: string) => columnService.deleteColumn(columnId),
    onSuccess: () => {
      addToast({
        title: "Success!",
        description: "Column deleted successfully!",
        color: "success",
        variant: "flat",
      });

      // Invalidate all columns queries
      queryClient.invalidateQueries({
        queryKey: columnKeys.all,
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to delete column";

      addToast({
        title: "Error",
        description: message,
        color: "danger",
        variant: "flat",
      });
    },
  });
};

// Reorder column tasks mutation
export const useReorderColumnTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      columnId,
      data,
    }: {
      columnId: string;
      data: ReorderColumnTasksRequest;
    }) => columnService.reorderColumnTasks(columnId, data),
    onSuccess: () => {
      addToast({
        title: "Success!",
        description: "Tasks reordered successfully!",
        color: "success",
        variant: "flat",
      });

      // Invalidate all columns queries to refresh task order
      queryClient.invalidateQueries({
        queryKey: columnKeys.all,
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to reorder tasks";

      addToast({
        title: "Error",
        description: message,
        color: "danger",
        variant: "flat",
      });
    },
  });
};

// Reorder columns mutation
export const useReorderColumns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderColumnsRequest) =>
      columnService.reorderColumns(data),
    onSuccess: (_response, variables) => {
      addToast({
        title: "Success!",
        description: "Columns reordered successfully!",
        color: "success",
        variant: "flat",
      });

      // Invalidate columns for this board
      queryClient.invalidateQueries({
        queryKey: columnKeys.board(variables.boardId),
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to reorder columns";

      addToast({
        title: "Error",
        description: message,
        color: "danger",
        variant: "flat",
      });
    },
  });
};
