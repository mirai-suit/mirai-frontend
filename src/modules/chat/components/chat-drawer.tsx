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

import { useChatStore } from "../store";
import { useMessages, useSendMessage, useBoardUsers } from "../api";
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

  // TanStack Query hooks - Direct usage (no Zustand store!)
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useMessages(boardId, { page: 1, limit: 50 });

  const { data: boardUsers } = useBoardUsers(boardId);
  const sendMessageMutation = useSendMessage();

  // Socket event handlers
  useEffect(() => {
    if (!isOpen || !boardId) return;

    // Initialize socket and join board room
    chatSocketService.init(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:8000",
    );
    chatSocketService.connect();
    chatSocketService.joinBoard(boardId);

    // Handle real-time message updates
    chatSocketService.onReceiveMessage(() => {
      // TanStack Query will handle the cache update
      refetchMessages();
    });

    // Handle typing indicators
    chatSocketService.onUserTyping((data) => {
      if (data.userId !== currentUserId) {
        if (data.isTyping) {
          setTypingUsers((prev) => [
            ...prev.filter((id) => id !== data.userId),
            data.userId,
          ]);
        } else {
          setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
        }
      }
    });

    // Cleanup on unmount or board change
    return () => {
      chatSocketService.leaveBoard();
      chatSocketService.offReceiveMessage();
      chatSocketService.offUserTyping();
    };
  }, [isOpen, boardId, currentUserId, refetchMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesData?.messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesData?.messages.length]);

  const handleSendMessage = async (
    text: string,
    mentionedUsers: string[] = [],
  ) => {
    if (!text.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        boardId,
        messageData: {
          text: text.trim(),
          mentionedUsers,
          replyToId: replyToMessage?.id,
        },
      });

      // Clear reply after sending
      if (replyToMessage) {
        setReplyToMessage(null);
      }

      // Broadcast via socket for real-time updates
      chatSocketService.sendMessage({
        id: `temp-${Date.now()}`, // Temporary ID
        text: text.trim(),
        senderId: currentUserId,
        sender: {
          id: currentUserId,
          firstName: currentUserName.split(" ")[0] || "",
          lastName: currentUserName.split(" ")[1] || "",
          email: "",
        },
        threadId: boardId,
        messageType: "text",
        mentionedUsers,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    chatSocketService.sendTyping(currentUserId, currentUserName, isTyping);
  };

  return (
    <Drawer
      classNames={{
        base: "max-w-md",
        body: "p-0",
      }}
      isOpen={isOpen}
      placement="right"
      size="lg"
      onClose={onClose}
    >
      <DrawerContent>
        <DrawerHeader className="flex flex-col gap-2 px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Board Chat</h3>
              <Chip color="primary" size="sm" variant="flat">
                {messagesData?.messages.length || 0} messages
              </Chip>
            </div>
            <div className="flex items-center gap-1">
              <Button
                isIconOnly
                className="text-default-500"
                size="sm"
                variant="light"
                onPress={toggleSearch}
              >
                <MagnifyingGlass size={16} />
              </Button>
              <Button
                isIconOnly
                className="text-default-500"
                size="sm"
                variant="light"
                onPress={onClose}
              >
                <X size={16} />
              </Button>
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
                {messagesData?.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    boardUsers={boardUsers?.users || []}
                    isOwn={message.senderId === currentUserId}
                    message={message}
                  />
                ))}

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <TypingIndicator typingUsers={typingUsers} />
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollShadow>
        </DrawerBody>

        <DrawerFooter className="flex flex-col gap-2 p-4 border-t">
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
