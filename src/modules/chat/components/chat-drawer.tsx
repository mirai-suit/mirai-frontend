import type { GetMessagesResponse } from "../types";

import React, { useEffect, useRef, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Input,
  Spinner,
  Chip,
  ScrollShadow,
} from "@heroui/react";
import { X, MagnifyingGlass } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";

import { useChatStore } from "../store";
import {
  useMessages,
  useSendMessage,
  useBoardUsers,
  chatKeys,
} from "../api/chat.api";
import { chatSocketService } from "../services/socket.service";
import { useAuthStore } from "../../auth/store";

import { OnlineUsers } from "./online-users";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { ReplyPreview } from "./reply-preview";
import { MessageInput } from "./message-input";

interface ChatDrawerProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  boardId,
  isOpen,
  onClose,
}) => {
  const {
    replyToMessage,
    setReplyToMessage,
    isSearchOpen,
    toggleSearch,
    searchQuery,
    setSearchQuery,
  } = useChatStore();

  const { user } = useAuthStore();
  const currentUserId = user?.id || "";
  const currentUserName = user ? `${user.firstName} ${user.lastName}` : "";

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // TanStack Query hooks - Direct usage (no Zustand store!)
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
    error: messagesError,
  } = useMessages(boardId, { page: 1, limit: 50 });

  const { data: boardUsers } = useBoardUsers(boardId);
  const sendMessageMutation = useSendMessage();

  // Socket event handlers
  useEffect(() => {
    if (!isOpen || !boardId) return;

    console.log("🚀 Setting up socket connection for board:", boardId);
    console.log(
      "🔌 Socket URL:",
      import.meta.env.VITE_SOCKET_URL || "http://localhost:8000"
    );

    // Initialize socket and connect
    chatSocketService.init(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:8000"
    );
    chatSocketService.connect();

    // Wait for connection before joining board
    const handleSocketConnect = () => {
      // eslint-disable-next-line no-console
      console.log("🏠 Socket connected, joining board:", boardId);
      chatSocketService.joinBoard(boardId);
    };

    // Set up connection handler
    if (chatSocketService.isConnected) {
      // Already connected
      chatSocketService.joinBoard(boardId);
    } else {
      // Wait for connection
      chatSocketService.onConnect(handleSocketConnect);
    }

    // Helper function to convert backend socket message to frontend Message
    const socketMessageToMessage = (socketMessage: any) => {
      // Backend sends: id, senderId, senderName, text, mentionedUsers, replyTo, createdAt
      // Frontend expects full Message structure
      return {
        id: socketMessage.id,
        text: socketMessage.text,
        senderId: socketMessage.senderId,
        threadId: "", // Not provided in socket message
        messageType: "text" as const,
        attachments: null,
        replyToId: socketMessage.replyTo?.id || undefined,
        replyTo: socketMessage.replyTo || undefined,
        replies: [],
        mentionedUsers: socketMessage.mentionedUsers || [],
        isEdited: false,
        editedAt: undefined,
        isDeleted: false,
        deletedAt: undefined,
        reactions: null,
        createdAt: socketMessage.createdAt,
        updatedAt: socketMessage.createdAt,
        sender: {
          id: socketMessage.senderId,
          firstName: socketMessage.senderName?.split(" ")[0] || "",
          lastName:
            socketMessage.senderName?.split(" ").slice(1).join(" ") || "",
          email: "", // Not provided in socket message
          avatar: undefined,
        },
      };
    };

    // Handle real-time message updates from OTHER users only
    chatSocketService.onReceiveMessage((socketMessage) => {
      // eslint-disable-next-line no-console
      console.log("🔔 Received socket message:", socketMessage);
      // eslint-disable-next-line no-console
      console.log("🔍 Current user ID:", currentUserId);
      // eslint-disable-next-line no-console
      console.log("🔍 Sender ID:", socketMessage.senderId);

      // Only update cache if the message is from another user
      if (socketMessage.senderId !== currentUserId) {
        // eslint-disable-next-line no-console
        console.log("✅ Processing message from another user");
        const message = socketMessageToMessage(socketMessage);

        // Validate the message before adding it
        if (!message || !message.id || !message.senderId) {
          // eslint-disable-next-line no-console
          console.warn("⚠️ Invalid message:", message);

          return;
        }

        // eslint-disable-next-line no-console
        console.log("📨 Converted message:", message);

        // Use the same exact query key that the component uses
        const exactQueryKey = [
          ...chatKeys.messages(boardId),
          { page: 1, limit: 50 },
        ];

        // eslint-disable-next-line no-console
        console.log("🔑 Query key for socket update:", exactQueryKey);

        // Use targeted cache update instead of full refetch
        queryClient.setQueryData<GetMessagesResponse>(exactQueryKey, (old) => {
          // eslint-disable-next-line no-console
          console.log("🔄 Old cache data:", old);

          if (!old) {
            // eslint-disable-next-line no-console
            console.log("❌ No old data found");

            return old;
          }

          // Check if message already exists (avoid duplicates)
          const exists = old.messages.some((m) => m && m.id === message.id);

          // eslint-disable-next-line no-console
          console.log("🔍 Message exists?", exists);

          if (exists) {
            // eslint-disable-next-line no-console
            console.log("⏭️ Message already exists, skipping");

            return old;
          }

          const updatedData = {
            ...old,
            messages: [...old.messages, message].filter(
              (m) => m && m.id && m.senderId
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

          // eslint-disable-next-line no-console
          console.log("✅ Updated cache data:", updatedData);

          return updatedData;
        });
      } else {
        // eslint-disable-next-line no-console
        console.log("⏭️ Ignoring own message");
      }
    });

    // Handle message edits from other users
    chatSocketService.onMessageEdited((data) => {
      const exactQueryKey = [
        ...chatKeys.messages(boardId),
        { page: 1, limit: 50 },
      ];

      queryClient.setQueryData<GetMessagesResponse>(exactQueryKey, (old) => {
        if (!old) return old;

        return {
          ...old,
          messages: old.messages
            .map((msg) =>
              msg && msg.id === data.messageId
                ? {
                    ...msg,
                    text: data.text,
                    isEdited: true,
                    editedAt: data.editedAt,
                  }
                : msg
            )
            .filter((m) => m && m.id && m.senderId),
        };
      });
    });

    // Handle message deletes from other users
    chatSocketService.onMessageDeleted((data) => {
      const exactQueryKey = [
        ...chatKeys.messages(boardId),
        { page: 1, limit: 50 },
      ];

      queryClient.setQueryData<GetMessagesResponse>(exactQueryKey, (old) => {
        if (!old) return old;

        return {
          ...old,
          messages: old.messages.filter(
            (msg) => msg && msg.id !== data.messageId
          ),
          pagination: {
            page: old.pagination?.page || 1,
            limit: old.pagination?.limit || 50,
            total: Math.max(
              0,
              (old.pagination?.total || old.messages.length) - 1
            ),
            totalPages: Math.ceil(
              Math.max(0, (old.pagination?.total || old.messages.length) - 1) /
                (old.pagination?.limit || 50)
            ),
          },
        };
      });
    });

    // Handle typing indicators
    chatSocketService.onUserTyping((data) => {
      // eslint-disable-next-line no-console
      console.log("👤 Typing indicator received:", data);

      if (data.userId !== currentUserId) {
        // eslint-disable-next-line no-console
        console.log("✅ Processing typing from another user");

        if (data.isTyping) {
          setTypingUsers((prev) => {
            const updated = [
              ...prev.filter((id) => id !== data.userId),
              data.userId,
            ];
            // eslint-disable-next-line no-console
            console.log("📝 Updated typing users (started):", updated);
            return updated;
          });
        } else {
          setTypingUsers((prev) => {
            const updated = prev.filter((id) => id !== data.userId);
            // eslint-disable-next-line no-console
            console.log("📝 Updated typing users (stopped):", updated);
            return updated;
          });
        }
      } else {
        // eslint-disable-next-line no-console
        console.log("⏭️ Ignoring own typing indicator");
      }
    });

    // Cleanup on unmount or board change
    return () => {
      chatSocketService.leaveBoard();
      chatSocketService.offConnect();
      chatSocketService.offReceiveMessage();
      chatSocketService.offUserTyping();
      chatSocketService.offMessageEdited();
      chatSocketService.offMessageDeleted();
    };
  }, [isOpen, boardId, currentUserId, refetchMessages]);

  // Auto-scroll to bottom when new messages arrive or typing indicator appears
  useEffect(() => {
    if (messagesData?.messages.length || typingUsers.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesData?.messages.length, typingUsers.length]);

  const handleSendMessage = async (
    text: string,
    mentionedUsers: string[] = []
  ) => {
    if (!text.trim() || !user?.id) return;

    try {
      await sendMessageMutation.mutateAsync({
        boardId,
        data: {
          text: text.trim(),
          mentionedUsers,
          replyToId: replyToMessage?.id,
        },
        currentUser: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar || undefined,
        },
      });

      // Clear reply after sending
      if (replyToMessage) {
        setReplyToMessage(null);
      }

      // Note: No manual socket broadcasting needed!
      // The server will broadcast to other users when it receives our API call
      // Our optimistic update already shows the message immediately
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      // Just log it for debugging
      if (error instanceof Error) {
        // eslint-disable-next-line no-console
        console.error("Failed to send message:", error.message);
      }
    }
  };

  const handleTyping = (isTyping: boolean) => {
    // eslint-disable-next-line no-console
    console.log("📝 Typing event:", {
      isTyping,
      currentUserId,
      currentUserName,
    });
    chatSocketService.sendTyping(currentUserId, currentUserName, isTyping);
  };

  return (
    <Drawer
      classNames={{
        body: "p-0",
      }}
      isOpen={isOpen}
      placement="right"
      size="lg"
      onClose={onClose}
      backdrop="opaque"
    >
      <DrawerContent className="bg-transparent backdrop-blur">
        <DrawerHeader className="flex flex-col gap-2 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Board Chat</h3>
              <Chip color="primary" size="sm" variant="flat">
                {messagesData?.messages.length || 0} messages
              </Chip>
            </div>
            <div className="flex items-center gap-1 mr-5">
              <Button
                isIconOnly
                className="text-default-500"
                size="sm"
                variant="light"
                onPress={toggleSearch}
              >
                <MagnifyingGlass size={16} />
              </Button>
              {/* <Button
                isIconOnly
                className="text-default-500"
                size="sm"
                variant="light"
                onPress={onClose}
              >
                <X size={16} />
              </Button> */}
            </div>
          </div>

          {/* Search Input */}
          {isSearchOpen && (
            <Input
              classNames={{
                input: "text-sm",
              }}
              placeholder="Search messages..."
              size="sm"
              startContent={<MagnifyingGlass size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}

          {/* Online Users */}
          <OnlineUsers boardUsers={boardUsers?.users || []} />
        </DrawerHeader>

        <DrawerBody className="flex flex-col gap-0">
          {/* Messages Area */}
          <ScrollShadow className="flex-1 px-4 py-2">
            {isLoadingMessages ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {(() => {
                  const messages = messagesData?.messages || [];

                  return messages
                    .filter(
                      (message) => message && message.id && message.senderId
                    )
                    .map((message) => (
                      <MessageBubble
                        key={message.id}
                        boardUsers={boardUsers?.users || []}
                        isOwn={message.senderId === currentUserId}
                        message={message}
                      />
                    ));
                })()}

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <TypingIndicator typingUsers={typingUsers} />
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollShadow>
        </DrawerBody>

        <DrawerFooter className="flex flex-col gap-2 p-3">
          {/* Reply Preview */}
          {replyToMessage && (
            <ReplyPreview
              message={replyToMessage}
              onClear={() => setReplyToMessage(null)}
            />
          )}

          {/* Message Input */}
          <MessageInput
            boardUsers={boardUsers?.users || []}
            isLoading={sendMessageMutation.isPending}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
