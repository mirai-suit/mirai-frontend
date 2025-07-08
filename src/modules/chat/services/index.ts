import type {
  SendMessageResponse,
  GetMessagesResponse,
  SearchMessagesResponse,
  GetBoardUsersResponse,
  EditMessageResponse,
  DeleteMessageResponse,
  MarkAsReadResponse,
} from "../types";
import type {
  SendMessageInput,
  EditMessageInput,
  SearchMessagesInput,
  GetMessagesInput,
} from "../validations";

import apiClient from "@/libs/axios/interceptor";

export const chatService = {
  // Send a message to a board
  async sendMessage(
    boardId: string,
    messageData: SendMessageInput
  ): Promise<SendMessageResponse> {
    const response = await apiClient.post(
      `/chat/${boardId}/messages`,
      messageData
    );

    return response.data;
  },

  // Get paginated messages for a board
  async getMessages(
    boardId: string,
    params: GetMessagesInput = { page: 1, limit: 20 }
  ): Promise<GetMessagesResponse> {
    // Convert page/limit to skip/take for backend compatibility
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;
    const take = limit;

    const response = await apiClient.get(`/chat/${boardId}/messages`, {
      params: { skip, take },
    });

    return response.data;
  },

  // Search messages in a board
  async searchMessages(
    boardId: string,
    searchParams: SearchMessagesInput
  ): Promise<SearchMessagesResponse> {
    const response = await apiClient.get(`/chat/${boardId}/messages/search`, {
      params: searchParams,
    });

    return response.data;
  },

  // Get board users for mentions autocomplete
  async getBoardUsersForMentions(
    boardId: string
  ): Promise<GetBoardUsersResponse> {
    const response = await apiClient.get(`/chat/${boardId}/users/mentions`);

    return response.data;
  },

  // Edit a message
  async editMessage(
    messageId: string,
    messageData: EditMessageInput
  ): Promise<EditMessageResponse> {
    const response = await apiClient.put(
      `/chat/messages/${messageId}`,
      messageData
    );

    return response.data;
  },

  // Delete a message
  async deleteMessage(messageId: string): Promise<DeleteMessageResponse> {
    const response = await apiClient.delete(`/chat/messages/${messageId}`);

    return response.data;
  },

  // Mark messages as read
  async markMessagesAsRead(boardId: string): Promise<MarkAsReadResponse> {
    const response = await apiClient.post(`/chat/${boardId}/messages/read`);

    return response.data;
  },
};
