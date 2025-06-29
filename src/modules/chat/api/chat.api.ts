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
  options?: UseQueryOptions<GetMessagesResponse>
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
  options?: UseQueryOptions<GetBoardUsersResponse>
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
  options?: UseQueryOptions<SearchMessagesResponse>
) => {
  return useQuery({
    queryKey: chatKeys.search(boardId, searchParams.query),
    queryFn: () => chatService.searchMessages(boardId, searchParams),
    enabled: !!boardId && !!searchParams.query && searchParams.query.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

// Send message mutation with optimistic updates
export const useSendMessage = (
  options?: UseMutationOptions<
    SendMessageResponse,
    Error,
    {
      boardId: string;
      data: SendMessageInput;
      currentUser: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
      };
    },
    {
      previousMessages: GetMessagesResponse | undefined;
      optimisticMessage: any;
      exactQueryKey: (string | { page: number; limit: number })[];
    }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, data }) => chatService.sendMessage(boardId, data),

    onMutate: async ({ boardId, data, currentUser }) => {
      // Get the exact query key being used (including params)
      const exactQueryKey = [
        ...chatKeys.messages(boardId),
        { page: 1, limit: 50 },
      ];

      console.log("🔑 Exact query key:", exactQueryKey);

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(boardId),
      });

      // Snapshot the previous value using the exact query key
      const previousMessages =
        queryClient.getQueryData<GetMessagesResponse>(exactQueryKey);

      // Create optimistic message
      const optimisticMessage = {
        id: `optimistic-${Date.now()}`,
        text: data.text,
        senderId: currentUser.id,
        threadId: boardId,
        messageType: "text" as const,
        attachments: null,
        replyToId: data.replyToId,
        replyTo: data.replyToId
          ? previousMessages?.messages?.find(
              (m: any) => m.id === data.replyToId
            )
          : undefined,
        replies: [],
        mentionedUsers: data.mentionedUsers || [],
        isEdited: false,
        editedAt: undefined,
        isDeleted: false,
        deletedAt: undefined,
        reactions: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          ...currentUser,
          // Ensure all required sender fields are present
          id: currentUser.id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          avatar: currentUser.avatar || null,
        },
      };

      console.log("📝 Creating optimistic message:", optimisticMessage);
      console.log("📦 Previous messages:", previousMessages);

      // Validate optimistic message before proceeding
      if (
        !optimisticMessage ||
        !optimisticMessage.id ||
        !optimisticMessage.senderId
      ) {
        console.error(
          "❌ Invalid optimistic message created:",
          optimisticMessage
        );

        return { previousMessages, optimisticMessage: null, exactQueryKey };
      }

      // Optimistically update the cache using the exact query key
      queryClient.setQueryData(
        exactQueryKey,
        (old: GetMessagesResponse | undefined) => {
          console.log("🔄 Optimistic update - old data:", old);

          if (!old) {
            const newData = {
              success: true,
              messages: [optimisticMessage],
              pagination: {
                page: 1,
                limit: 50, // Match the limit used in chat-drawer
                total: 1,
                totalPages: 1,
              },
            };

            console.log("✨ No old data, creating new:", newData);

            return newData;
          }

          const updatedData = {
            ...old,
            messages: [...old.messages, optimisticMessage].filter(
              (msg) => msg && msg.id && msg.senderId
            ),
            pagination: {
              page: old.pagination?.page || 1,
              limit: old.pagination?.limit || 50,
              total: (old.pagination?.total || old.messages.length) + 1,
              totalPages: Math.ceil(
                ((old.pagination?.total || old.messages.length) + 1) /
                  (old.pagination?.limit || 50)
              ),
            },
          };

          console.log("📊 Updated data with optimistic message:", updatedData);

          return updatedData;
        }
      );

      // Return context for rollback
      return { previousMessages, optimisticMessage, exactQueryKey };
    },

    onError: (error, _variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousMessages && context?.exactQueryKey) {
        queryClient.setQueryData(
          context.exactQueryKey,
          context.previousMessages
        );
      }

      // Optionally show error toast, but do not block input
      // addToast({
      //   title: "Error",
      //   description: error.message || "Failed to send message",
      //   color: "danger",
      // });
    },

    onSuccess: (response, { boardId: _boardId }, context) => {
      console.log("✅ Message sent successfully:", response);
      console.log("🔄 Context for replacement:", context);

      // Replace optimistic message with real message from server
      if (context?.exactQueryKey) {
        queryClient.setQueryData(
          context.exactQueryKey,
          (old: GetMessagesResponse | undefined) => {
            if (!old) return old;

            // Only replace if we have a valid context and optimistic message
            if (context?.optimisticMessage?.id) {
              console.log("🔄 Replacing optimistic message with real message");
              console.log("🔄 Response message:", response.message);

              if (!response.message || !response.message.id) {
                console.error(
                  "❌ Invalid message received from server:",
                  response
                );

                return old;
              }

              return {
                ...old,
                messages: old.messages
                  .map((msg) =>
                    msg.id === context.optimisticMessage.id
                      ? response.message
                      : msg
                  )
                  .filter((msg) => msg && msg.id && msg.senderId),
              };
            }

            // If no optimistic message to replace, just add the new message
            // This can happen if the optimistic update failed
            const messageExists = old.messages.some(
              (msg) => msg && msg.id === response.message?.id
            );

            if (!messageExists && response.message?.id) {
              console.log(
                "➕ Adding new message (no optimistic message to replace)"
              );

              return {
                ...old,
                messages: [...old.messages, response.message].filter(
                  (msg) => msg && msg.id && msg.senderId
                ),
                pagination: {
                  page: old.pagination?.page || 1,
                  limit: old.pagination?.limit || 50,
                  total: (old.pagination?.total || old.messages.length) + 1,
                  totalPages: Math.ceil(
                    ((old.pagination?.total || old.messages.length) + 1) /
                      (old.pagination?.limit || 50)
                  ),
                },
              };
            }

            console.log("✅ Message already exists, no changes needed");

            return old;
          }
        );
      }

      // Removed success toast to avoid blocking input
    },

    ...options,
  });
};

// Edit message mutation with optimistic updates
export const useEditMessage = (
  options?: UseMutationOptions<
    EditMessageResponse,
    Error,
    {
      messageId: string;
      data: EditMessageInput;
      boardId: string;
    },
    { previousMessages: GetMessagesResponse | undefined }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, data }) =>
      chatService.editMessage(messageId, data),

    onMutate: async ({ messageId, data, boardId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(boardId),
      });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<GetMessagesResponse>(
        chatKeys.messages(boardId)
      );

      // Optimistically update the message
      queryClient.setQueryData<GetMessagesResponse>(
        chatKeys.messages(boardId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            messages: old.messages.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    text: data.text,
                    isEdited: true,
                    editedAt: new Date().toISOString(),
                  }
                : msg
            ),
          };
        }
      );

      return { previousMessages };
    },

    onError: (error, { boardId }, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatKeys.messages(boardId),
          context.previousMessages
        );
      }

      // Optionally show error toast, but do not block input
      // addToast({
      //   title: "Error",
      //   description: error.message || "Failed to edit message",
      //   color: "danger",
      // });
    },

    onSuccess: (response, { boardId }) => {
      // Replace with real data from server
      queryClient.setQueryData<GetMessagesResponse>(
        chatKeys.messages(boardId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            messages: old.messages.map((msg) =>
              msg.id === response.data.id ? response.data : msg
            ),
          };
        }
      );

      // Removed success toast to avoid blocking input
    },

    ...options,
  });
};

// Delete message mutation with optimistic updates
export const useDeleteMessage = (
  options?: UseMutationOptions<
    DeleteMessageResponse,
    Error,
    {
      messageId: string;
      boardId: string;
    },
    { previousMessages: GetMessagesResponse | undefined }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId }) => chatService.deleteMessage(messageId),

    onMutate: async ({ messageId, boardId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(boardId),
      });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<GetMessagesResponse>(
        chatKeys.messages(boardId)
      );

      // Optimistically remove the message
      queryClient.setQueryData<GetMessagesResponse>(
        chatKeys.messages(boardId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            messages: old.messages.filter((msg) => msg.id !== messageId),
            pagination: {
              ...old.pagination,
              total: Math.max(0, old.pagination.total - 1),
            },
          };
        }
      );

      return { previousMessages };
    },

    onError: (error, { boardId }, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatKeys.messages(boardId),
          context.previousMessages
        );
      }

      // Optionally show error toast, but do not block input
      // addToast({
      //   title: "Error",
      //   description: error.message || "Failed to delete message",
      //   color: "danger",
      // });
    },

    onSuccess: (_, { boardId }) => {
      // Success already handled by optimistic update
      // Just invalidate search results
      queryClient.invalidateQueries({
        queryKey: [...chatKeys.all, "search", boardId],
      });

      // Removed success toast to avoid blocking input
    },

    ...options,
  });
};

// Mark messages as read mutation
export const useMarkAsRead = (
  options?: UseMutationOptions<MarkAsReadResponse, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => chatService.markMessagesAsRead(boardId),
    onSuccess: (_, boardId) => {
      // Invalidate messages to refresh read status
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(boardId) });
    },
    onError: (error) => {
      // Optionally show error toast, but do not block input
      // addToast({
      //   title: "Error",
      //   description: error.message || "Failed to mark messages as read",
      //   color: "danger",
      // });
    },
    ...options,
  });
};
