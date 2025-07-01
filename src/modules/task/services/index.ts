// Reorder tasks in a column (using apiClient for consistency)
async function reorderTasks(columnId: string, taskIds: string[]) {
  console.log("[SERVICE] reorderTasks called", { columnId, taskIds });
  const response = await apiClient.patch(`/task/column/${columnId}/reorder`, {
    taskIds,
  });

  return response.data;
}
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
  TaskQueryParams,
} from "../types";

import apiClient from "../../../libs/axios/interceptor";

export const taskService = {
  reorderTasks,
  // Create a new task
  async createTask(data: CreateTaskRequest): Promise<CreateTaskResponse> {
    const response = await apiClient.post("/task", data);

    return response.data;
  },

  // Create a new task with file attachments
  async createTaskWithFiles(
    data: CreateTaskRequest,
    files: File[]
  ): Promise<CreateTaskResponse> {
    const formData = new FormData();

    // Add task data as form fields
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("status", data.status || "NOT_STARTED");
    formData.append("customStatus", data.customStatus || "");
    formData.append("priority", data.priority || "MEDIUM");
    formData.append("boardId", data.boardId);
    formData.append("columnId", data.columnId);

    // Only append teamId if it exists and is not empty
    if (data.teamId && data.teamId.trim() !== "") {
      formData.append("teamId", data.teamId);
    }

    formData.append("order", (data.order || 0).toString());
    formData.append("isRecurring", (data.isRecurring || false).toString());

    if (data.startDate) formData.append("startDate", data.startDate);
    if (data.dueDate) formData.append("dueDate", data.dueDate);

    // Add assignee IDs (match the backend expectation)
    if (data.assigneeIds && data.assigneeIds.length > 0) {
      data.assigneeIds.forEach((id) => formData.append("assigneeIds", id));
    }

    // Add files
    files.forEach((file) => formData.append("attachments", file));

    const response = await apiClient.post("/task", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Get a task by ID
  async getTaskById(taskId: string): Promise<GetTaskResponse> {
    const response = await apiClient.get(`/task/${taskId}`);

    return response.data;
  },

  // Get all tasks for a board
  async getTasksForBoard(boardId: string): Promise<GetTasksResponse> {
    const response = await apiClient.get(`/task/board/${boardId}`);

    return response.data;
  },

  // Get all tasks for a column
  async getTasksForColumn(columnId: string): Promise<GetTasksResponse> {
    const response = await apiClient.get(`/task/column/${columnId}`);

    return response.data;
  },

  // Update a task
  async updateTask(
    taskId: string,
    data: UpdateTaskRequest
  ): Promise<UpdateTaskResponse> {
    const response = await apiClient.put(`/task/${taskId}`, data);

    return response.data;
  },

  // Move a task between columns
  async moveTask(
    taskId: string,
    data: MoveTaskRequest
  ): Promise<MoveTaskResponse> {
    const response = await apiClient.patch(`/task/${taskId}/move`, data);

    return response.data;
  },

  // Assign users to a task
  async assignUsers(
    taskId: string,
    data: AssignUsersRequest
  ): Promise<AssignUsersResponse> {
    const response = await apiClient.patch(`/task/${taskId}/assign`, data);

    return response.data;
  },

  // Delete a task (soft delete)
  async deleteTask(taskId: string): Promise<DeleteTaskResponse> {
    const response = await apiClient.delete(`/task/${taskId}`);

    return response.data;
  },

  // Search/filter tasks (future implementation)
  async searchTasks(params: TaskQueryParams): Promise<GetTasksResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.status) searchParams.append("status", params.status);
    if (params.priority)
      searchParams.append("priority", params.priority.toString());
    if (params.assignee) searchParams.append("assignee", params.assignee);
    if (params.dueDate) searchParams.append("dueDate", params.dueDate);
    if (params.search) searchParams.append("search", params.search);

    const response = await apiClient.get(
      `/task/search?${searchParams.toString()}`
    );

    return response.data;
  },
};
