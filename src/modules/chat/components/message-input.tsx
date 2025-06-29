import type { BoardUser } from "../types";

import React, { useState, useRef, useCallback } from "react";
import {
  Button,
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Textarea,
} from "@heroui/react";
import { PaperPlaneRight, At } from "@phosphor-icons/react";

import { useChatStore } from "../store";

interface MessageInputProps {
  onSendMessage: (text: string, mentionedUsers: string[]) => void;
  onTyping: (isTyping: boolean) => void;
  boardUsers: BoardUser[];
  isLoading?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  boardUsers,
  isLoading = false,
}) => {
  const [message, setMessage] = useState("");
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { replyToMessage } = useChatStore();

  // Handle typing indicators
  const handleTypingStart = useCallback(() => {
    onTyping(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  }, [onTyping]);

  const handleTypingStop = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onTyping(false);
  }, [onTyping]);

  // Handle message input changes
  const handleInputChange = (value: string) => {
    setMessage(value);

    if (value.trim()) {
      handleTypingStart();
    } else {
      handleTypingStop();
    }

    // Check for @ mentions
    const lastAtIndex = value.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const afterAt = value.substring(lastAtIndex + 1);
      const spaceIndex = afterAt.indexOf(" ");

      if (spaceIndex === -1) {
        // Still typing a mention
        setMentionQuery(afterAt);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Handle mention selection
  const handleMentionSelect = (userId: string) => {
    const user = boardUsers.find((u) => u.id === userId);

    if (!user) return;

    const lastAtIndex = message.lastIndexOf("@");
    const beforeAt = message.substring(0, lastAtIndex);
    const afterAt = message.substring(lastAtIndex + 1);
    const spaceIndex = afterAt.indexOf(" ");
    const afterMention = spaceIndex !== -1 ? afterAt.substring(spaceIndex) : "";

    const newMessage = `${beforeAt}@${user.firstName} ${user.lastName}${afterMention} `;

    setMessage(newMessage);
    setShowMentions(false);
    setMentionQuery("");

    // Add to mentioned users if not already included
    if (!mentionedUsers.includes(userId)) {
      setMentionedUsers([...mentionedUsers, userId]);
    }

    // Focus back to input
    inputRef.current?.focus();
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isLoading) return;

    onSendMessage(message.trim(), mentionedUsers);

    // Reset form
    setMessage("");
    setMentionedUsers([]);
    setShowMentions(false);
    setMentionQuery("");
    handleTypingStop();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Filter users for mentions
  const filteredUsers = boardUsers.filter((user) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(mentionQuery.toLowerCase())
  );

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      {/* Mentions Autocomplete */}
      {showMentions && filteredUsers.length > 0 && (
        <div className="max-h-48 overflow-y-auto">
          <Autocomplete
            inputValue={mentionQuery}
            placeholder="Mention someone..."
            size="sm"
            startContent={<At size={16} />}
            onInputChange={setMentionQuery}
            onSelectionChange={(key) =>
              key && handleMentionSelect(key as string)
            }
          >
            {filteredUsers.map((user) => (
              <AutocompleteItem
                key={user.id}
                textValue={`${user.firstName} ${user.lastName}`}
              >
                <div className="flex items-center gap-2">
                  <Avatar
                    name={`${user.firstName} ${user.lastName}`}
                    size="sm"
                    src={user.avatar}
                  />
                  <div>
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-default-500">{user.email}</p>
                  </div>
                </div>
              </AutocompleteItem>
            ))}
          </Autocomplete>
        </div>
      )}

      {/* Message Input */}
      <div className="flex gap-2 items-end">
        <Textarea
          ref={inputRef}
          classNames={{
            input: "min-h-[40px]",
          }}
          endContent={
            <Button
              isIconOnly
              color="primary"
              isDisabled={!message.trim() || isLoading}
              isLoading={isLoading}
              size="sm"
              type="submit"
              variant="flat"
            >
              <PaperPlaneRight size={16} />
            </Button>
          }
          maxRows={4}
          placeholder={
            replyToMessage
              ? `Reply to ${replyToMessage.sender.firstName}...`
              : "Type a message..."
          }
          value={message}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
        />
      </div>
    </form>
  );
};
