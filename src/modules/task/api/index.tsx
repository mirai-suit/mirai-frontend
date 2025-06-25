import type {
  CreateTaskRequest,
  CreateTaskResponse,
  GetTaskResponse,
  GetTasksResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
  DeleteTaskResponse,
  MoveTaskRequest,
  MoveTaskResponse,
  AssignUsersRequest,
  AssignUsersResponse,
} from "../types";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { addToast } from "@heroui/react";

import { taskService } from "../services";
import { boardKeys } from "../../board/api";
import { columnKeys } from "../../column/api";

// Query Keys - Consistent Pattern: [entity, scope, identifier]
export const taskKeys = {
  all: ["tasks"] as const,
  board: (boardId: string) => [...taskKeys.all, "board", boardId] as const,
  column: (columnId: string) => [...taskKeys.all, "column", columnId] as const,
  detail: (taskId: string) => [...taskKeys.all, "detail", taskId] as const,
};

// Get tasks for a board
export const useTasksForBoard = (
  boardId: string,
  options?: UseQueryOptions<GetTasksResponse>,
) => {
  return useQuery({
    queryKey: taskKeys.board(boardId),
    queryFn: () => taskService.getTasksForBoard(boardId),
    enabled: !!boardId,
    ...options,
  });
};

// Get tasks for a column
export const useTasksForColumn = (
  columnId: string,
  options?: UseQueryOptions<GetTasksResponse>,
) => {
  return useQuery({
    queryKey: taskKeys.column(columnId),
    queryFn: () => taskService.getTasksForColumn(columnId),
    enabled: !!columnId,
    ...options,
  });
};

// Get single task
export const useTask = (
  taskId: string,
  options?: UseQueryOptions<GetTaskResponse>,
) => {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => taskService.getTaskById(taskId),
    enabled: !!taskId,
    ...options,
  });
};

// Create task mutation (simplified)
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateTaskResponse, Error, CreateTaskRequest>({
    mutationFn: taskService.createTask,
    onSuccess: (data, variables) => {
      // Invalidate the board query that contains the tasks
      queryClient.invalidateQueries({
        queryKey: boardKeys.detail(variables.boardId),
      });

      // Also invalidate columns in case they have task counts
      queryClient.invalidateQueries({
        queryKey: columnKeys.board(variables.boardId),
      });

      // Keep task-specific queries in sync too
      queryClient.invalidateQueries({
        queryKey: taskKeys.board(variables.boardId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.column(variables.columnId),
      });

      // Show success toast
      addToast({
        title: "Task Created",
        description: `"${data.task.title}" has been created successfully!`,
        color: "success",
      });
    },
    onError: () => {
      // Show error toast
      addToast({
        title: "Creation Failed",
        description: "Failed to create task. Please try again.",
        color: "danger",
      });
    },
  });
};

// Update task mutation (simplified)
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateTaskResponse,
    Error,
    { taskId: string; data: UpdateTaskRequest }
  >({
    mutationFn: ({ taskId, data }) => taskService.updateTask(taskId, data),
    onSuccess: (response, { taskId }) => {
      // Invalidate board query (primary data source)
      queryClient.invalidateQueries({
        queryKey: boardKeys.detail(response.task.boardId),
      });

      // Invalidate columns
      queryClient.invalidateQueries({
        queryKey: columnKeys.board(response.task.boardId),
      });

      // Keep task-specific queries in sync
      queryClient.invalidateQueries({
        queryKey: taskKeys.board(response.task.boardId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.column(response.task.columnId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(taskId),
      });

      // Show success toast
      addToast({
        title: "Task Updated",
        description: `"${response.task.title}" has been updated successfully!`,
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Update Failed",
        description: "Failed to update task. Please try again.",
        color: "danger",
      });
    },
  });
};

// Move task mutation (simplified)
export const useMoveTask = () => {
  const queryClient = useQueryClient();

  return useMutation<
    MoveTaskResponse,
    Error,
    { taskId: string; data: MoveTaskRequest }
  >({
    mutationFn: ({ taskId, data }) => taskService.moveTask(taskId, data),
    onSuccess: (response, { data, taskId }) => {
      // Simple cache invalidation
      queryClient.invalidateQueries({
        queryKey: taskKeys.column(data.sourceColumnId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.column(data.targetColumnId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.board(response.task.boardId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(taskId),
      });

      addToast({
        title: "Task Moved",
        description: `"${response.task.title}" has been moved successfully!`,
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Move Failed",
        description: "Failed to move task. Please try again.",
        color: "danger",
      });
    },
  });
};

// Assign users mutation (simplified)
export const useAssignUsers = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AssignUsersResponse,
    Error,
    { taskId: string; data: AssignUsersRequest }
  >({
    mutationFn: ({ taskId, data }) => taskService.assignUsers(taskId, data),
    onSuccess: (response, { taskId }) => {
      // Simple cache invalidation
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(taskId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.board(response.task.boardId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.column(response.task.columnId),
      });

      addToast({
        title: "Users Assigned",
        description: `Users assigned to "${response.task.title}" successfully!`,
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Assignment Failed",
        description: "Failed to assign users. Please try again.",
        color: "danger",
      });
    },
  });
};

// Delete task mutation (simplified)
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteTaskResponse, Error, string>({
    mutationFn: taskService.deleteTask,
    onSuccess: (_response, taskId) => {
      // Since we don't have boardId in delete response, invalidate all task queries
      queryClient.invalidateQueries({
        queryKey: taskKeys.all,
      });
      queryClient.removeQueries({
        queryKey: taskKeys.detail(taskId),
      });

      addToast({
        title: "Task Deleted",
        description: "Task has been deleted successfully!",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Deletion Failed",
        description: "Failed to delete task. Please try again.",
        color: "danger",
      });
    },
  });
};
