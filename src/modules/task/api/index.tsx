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

// Query Keys
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  boardTasks: (boardId: string) =>
    [...taskKeys.lists(), "board", boardId] as const,
  columnTasks: (columnId: string) =>
    [...taskKeys.lists(), "column", columnId] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (taskId: string) => [...taskKeys.details(), taskId] as const,
};

// Get tasks for a board
export const useTasksForBoard = (
  boardId: string,
  options?: UseQueryOptions<GetTasksResponse>
) => {
  return useQuery({
    queryKey: taskKeys.boardTasks(boardId),
    queryFn: () => taskService.getTasksForBoard(boardId),
    enabled: !!boardId,
    ...options,
  });
};

// Get tasks for a column
export const useTasksForColumn = (
  columnId: string,
  options?: UseQueryOptions<GetTasksResponse>
) => {
  return useQuery({
    queryKey: taskKeys.columnTasks(columnId),
    queryFn: () => taskService.getTasksForColumn(columnId),
    enabled: !!columnId,
    ...options,
  });
};

// Get single task
export const useTask = (
  taskId: string,
  options?: UseQueryOptions<GetTaskResponse>
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
      // Simple cache invalidation to refresh the lists
      queryClient.invalidateQueries({
        queryKey: taskKeys.boardTasks(variables.boardId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.columnTasks(variables.columnId),
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
      // Simple cache invalidation
      queryClient.invalidateQueries({
        queryKey: taskKeys.boardTasks(response.task.boardId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.columnTasks(response.task.columnId),
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
        queryKey: taskKeys.columnTasks(data.sourceColumnId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.columnTasks(data.targetColumnId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.boardTasks(response.task.boardId),
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
        queryKey: taskKeys.boardTasks(response.task.boardId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.columnTasks(response.task.columnId),
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
      // Simple cache invalidation
      queryClient.invalidateQueries({
        queryKey: taskKeys.lists(),
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
