import {
  CreateColumnRequest,
  UpdateColumnRequest,
  ReorderColumnTasksRequest,
  ColumnApiResponse,
  ColumnsApiResponse,
} from "../types";

import apiClient from "@/libs/axios/interceptor";

// Create a new column
export const createColumn = async (
  data: CreateColumnRequest,
): Promise<ColumnApiResponse> => {
  const response = await apiClient.post("/column/create", data);

  return response.data;
};

// Get all columns for a board
export const getColumnsForBoard = async (
  boardId: string,
): Promise<ColumnsApiResponse> => {
  const response = await apiClient.get(`/column/board/${boardId}`);

  return response.data;
};

// Update a column
export const updateColumn = async (
  data: UpdateColumnRequest,
): Promise<ColumnApiResponse> => {
  const response = await apiClient.patch("/column/update", data);

  return response.data;
};

// Delete a column
export const deleteColumn = async (
  columnId: string,
): Promise<ColumnApiResponse> => {
  const response = await apiClient.delete(`/column/delete/${columnId}`);

  return response.data;
};

// Reorder tasks in a column
export const reorderColumnTasks = async (
  columnId: string,
  data: ReorderColumnTasksRequest,
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post(
    `/column/reorder-tasks/${columnId}`,
    data,
  );

  return response.data;
};
