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

// Get messages for a board
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

// Get board users for mentions
export const useBoardUsers = (
  boardId: string,
  options?: UseQueryOptions<GetBoardUsersResponse>,
) => {
  return useQuery({
    queryKey: chatKeys.users(boardId),
    queryFn: () => chatService.getBoardUsersForMentions(boardId),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 10, // 10 minutes (users don't change frequently)
    ...options,
  });
};

// Search messages
export const useSearchMessages = (
  boardId: string,
  searchParams: SearchMessagesInput,
  options?: UseQueryOptions<SearchMessagesResponse>,
) => {
  return useQuery({
    queryKey: chatKeys.search(boardId, searchParams.query),
    queryFn: () => chatService.searchMessages(boardId, searchParams),
    enabled: !!boardId && !!searchParams.query && searchParams.query.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

// Send message mutation
export const useSendMessage = (
  options?: UseMutationOptions<
    SendMessageResponse,
    Error,
    {
      boardId: string;
      data: SendMessageInput;
    }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, data }) => chatService.sendMessage(boardId, data),
    onSuccess: (response, { boardId }) => {
      // Invalidate messages to refetch with new message
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(boardId) });

      addToast({
        title: "Success",
        description: "Message sent successfully",
        color: "success",
      });
    },
    onError: (error) => {
      addToast({
        title: "Error",
        description: error.message || "Failed to send message",
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
    {
      messageId: string;
      data: EditMessageInput;
      boardId: string;
    }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, data }) => chatService.editMessage(messageId, data),
    onSuccess: (_, { boardId }) => {
      // Invalidate messages and search results
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(boardId) });
      queryClient.invalidateQueries({
        queryKey: [...chatKeys.all, "search", boardId],
      });

      addToast({
        title: "Success",
        description: "Message updated successfully",
        color: "success",
      });
    },
    onError: (error) => {
      addToast({
        title: "Error",
        description: error.message || "Failed to edit message",
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
    {
      messageId: string;
      boardId: string;
    }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId }) => chatService.deleteMessage(messageId),
    onSuccess: (_, { boardId }) => {
      // Invalidate messages and search results
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(boardId) });
      queryClient.invalidateQueries({
        queryKey: [...chatKeys.all, "search", boardId],
      });

      addToast({
        title: "Success",
        description: "Message deleted successfully",
        color: "success",
      });
    },
    onError: (error) => {
      addToast({
        title: "Error",
        description: error.message || "Failed to delete message",
        color: "danger",
      });
    },
    ...options,
  });
};

// Mark messages as read mutation
export const useMarkAsRead = (
  options?: UseMutationOptions<MarkAsReadResponse, Error, string>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => chatService.markMessagesAsRead(boardId),
    onSuccess: (_, boardId) => {
      // Invalidate messages to refresh read status
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(boardId) });
    },
    onError: (error) => {
      addToast({
        title: "Error",
        description: error.message || "Failed to mark messages as read",
        color: "danger",
      });
    },
    ...options,
  });
};
