import type {
  GetMessagesResponse,
  SearchMessagesResponse,
  GetBoardUsersResponse,
  SendMessageResponse,
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

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { addToast } from "@heroui/react";

import { chatService } from "../services";

// Query Keys
export const chatKeys = {
  all: ["chat"] as const,
  messages: (boardId: string) =>
    [...chatKeys.all, "messages", boardId] as const,
  search: (boardId: string, query: string) =>
    [...chatKeys.all, "search", boardId, query] as const,
  users: (boardId: string) => [...chatKeys.all, "users", boardId] as const,
};

// Get messages for a board (with pagination)
export const useMessages = (
  boardId: string,
  params: GetMessagesInput = { page: 1, limit: 20 },
  options?: UseQueryOptions<GetMessagesResponse>,
) => {
  return useQuery({
    queryKey: [...chatKeys.messages(boardId), params],
    queryFn: () => chatService.getMessages(boardId, params),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

// Search messages in a board
export const useSearchMessages = (
  boardId: string,
  searchParams: SearchMessagesInput,
  options?: UseQueryOptions<SearchMessagesResponse>,
) => {
  return useQuery({
    queryKey: chatKeys.search(boardId, searchParams.query),
    queryFn: () => chatService.searchMessages(boardId, searchParams),
    enabled: !!boardId && !!searchParams.query,
    staleTime: 1000 * 60 * 5, // 5 minutes for search results
    ...options,
  });
};

// Get board users for mentions
export const useBoardUsers = (
  boardId: string,
  options?: UseQueryOptions<GetBoardUsersResponse>,
) => {
  return useQuery({
    queryKey: chatKeys.users(boardId),
    queryFn: () => chatService.getBoardUsersForMentions(boardId),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 10, // 10 minutes for user list
    ...options,
  });
};

// Send message mutation
export const useSendMessage = (
  options?: UseMutationOptions<
    SendMessageResponse,
    Error,
    { boardId: string; messageData: SendMessageInput }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, messageData }) =>
      chatService.sendMessage(boardId, messageData),
    onSuccess: (data, variables) => {
      // Update messages cache with new message
      queryClient.setQueryData(
        chatKeys.messages(variables.boardId),
        (oldData: GetMessagesResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            messages: [...oldData.messages, data.data],
          };
        },
      );

      // Invalidate messages to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(variables.boardId),
      });

      addToast({
        title: "Message sent successfully",
        color: "success",
      });
    },
    onError: (error) => {
      addToast({
        title: "Failed to send message",
        description: error.message,
        color: "danger",
      });
    },
    ...options,
  });
};

// Edit message mutation
export const useEditMessage = (
  options?: UseMutationOptions<
    EditMessageResponse,
    Error,
    { messageId: string; messageData: EditMessageInput; boardId: string }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, messageData }) =>
      chatService.editMessage(messageId, messageData),
    onSuccess: (data, variables) => {
      // Update messages cache with edited message
      queryClient.setQueryData(
        chatKeys.messages(variables.boardId),
        (oldData: GetMessagesResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            messages: oldData.messages.map((msg) =>
              msg.id === variables.messageId ? data.data : msg,
            ),
          };
        },
      );

      addToast({
        title: "Message updated successfully",
        color: "success",
      });
    },
    onError: (error) => {
      addToast({
        title: "Failed to edit message",
        description: error.message,
        color: "danger",
      });
    },
    ...options,
  });
};

// Delete message mutation
export const useDeleteMessage = (
  options?: UseMutationOptions<
    DeleteMessageResponse,
    Error,
    { messageId: string; boardId: string }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId }) => chatService.deleteMessage(messageId),
    onSuccess: (data, variables) => {
      // Remove message from cache
      queryClient.setQueryData(
        chatKeys.messages(variables.boardId),
        (oldData: GetMessagesResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            messages: oldData.messages.filter(
              (msg) => msg.id !== variables.messageId,
            ),
          };
        },
      );

      addToast({
        title: "Message deleted successfully",
        color: "success",
      });
    },
    onError: (error) => {
      addToast({
        title: "Failed to delete message",
        description: error.message,
        color: "danger",
      });
    },
    ...options,
  });
};

// Mark messages as read mutation
export const useMarkAsRead = (
  options?: UseMutationOptions<MarkAsReadResponse, Error, { boardId: string }>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId }) => chatService.markMessagesAsRead(boardId),
    onSuccess: (data, variables) => {
      // Invalidate messages to refresh read status
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(variables.boardId),
      });
    },
    onError: (error) => {
      addToast({
        title: "Failed to mark messages as read",
        description: error.message,
        color: "danger",
      });
    },
    ...options,
  });
};
