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

import apiClient from "@/libs/axios/interceptor";

export const boardService = {
  // Create a new board
  async createBoard(boardData: CreateBoardInput): Promise<CreateBoardResponse> {
    const response = await apiClient.post("/board/create", boardData);

    return response.data;
  },

  // Get board by ID
  async getBoardById(boardId: string): Promise<GetBoardResponse> {
    const response = await apiClient.get(`/board/${boardId}`);

    return response.data;
  },

  // Get all boards for an organization
  async getBoardsForOrganization(
    organizationId: string
  ): Promise<GetBoardsResponse> {
    const response = await apiClient.get(
      `/board/organization/${organizationId}`
    );

    return response.data;
  },

  // Update a board
  async updateBoard(
    boardId: string,
    updateData: UpdateBoardInput
  ): Promise<UpdateBoardResponse> {
    const response = await apiClient.put(`/board/${boardId}`, updateData);

    return response.data;
  },

  // Delete a board
  async deleteBoard(boardId: string): Promise<DeleteBoardResponse> {
    const response = await apiClient.delete(`/board/${boardId}`);

    return response.data;
  },

  // Add user to board
  async addUserToBoard(
    boardId: string,
    accessData: BoardAccessInput
  ): Promise<BoardAccessResponse> {
    const response = await apiClient.post(
      `/board/${boardId}/access`,
      accessData
    );

    return response.data;
  },

  // Remove user from board
  async removeUserFromBoard(
    boardId: string,
    userId: string
  ): Promise<BoardAccessResponse> {
    const response = await apiClient.delete(
      `/board/${boardId}/access/${userId}`
    );

    return response.data;
  },

  // Change user board role
  async changeUserBoardRole(
    boardId: string,
    userId: string,
    accessRole: string
  ): Promise<BoardAccessResponse> {
    const response = await apiClient.put(`/board/${boardId}/access/${userId}`, {
      accessRole,
    });

    return response.data;
  },
};
