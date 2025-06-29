import type { Message, BoardUser } from "../types";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Avatar,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
} from "@heroui/react";
import {
  ArrowBendDoubleUpLeft,
  DotsThreeVertical,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";

import { useChatStore } from "../store";
import { useEditMessage, useDeleteMessage } from "../api";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  boardUsers: BoardUser[];
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  boardUsers,
}) => {
  const { setReplyToMessage, startEditingMessage } = useChatStore();
  const [showActions, setShowActions] = useState(false);

  const editMessageMutation = useEditMessage();
  const deleteMessageMutation = useDeleteMessage();

  const handleReply = () => {
    setReplyToMessage(message);
  };

  const handleEdit = () => {
    startEditingMessage(message.id, message.text);
  };

  const handleDelete = async () => {
    try {
      await deleteMessageMutation.mutateAsync({
        messageId: message.id,
        boardId: message.threadId,
      });
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMentionedUserNames = () => {
    if (!message.mentionedUsers?.length) return [];

    return message.mentionedUsers
      .map((userId) => {
        const user = boardUsers.find((u) => u.id === userId);

        return user ? `${user.firstName} ${user.lastName}` : null;
      })
      .filter(Boolean);
  };

  const mentionedNames = getMentionedUserNames();

  return (
    <div
      className={`flex gap-3 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isOwn && (
        <Avatar
          className="flex-shrink-0"
          name={`${message.sender.firstName} ${message.sender.lastName}`}
          size="sm"
          src={message.sender.avatar}
        />
      )}

      {/* Message Content */}
      <div
        className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}
      >
        {/* Sender Name & Time */}
        {!isOwn && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-default-700">
              {message.sender.firstName} {message.sender.lastName}
            </span>
            <span className="text-xs text-default-400">
              {formatTime(message.createdAt)}
            </span>
          </div>
        )}

        {/* Reply Reference */}
        {message.replyTo && (
          <Card
            className="bg-default-50 border-l-3 border-primary"
            shadow="none"
          >
            <CardBody className="px-3 py-2">
              <p className="text-xs text-default-500">
                Replying to {message.replyTo.sender.firstName}
              </p>
              <p className="text-sm text-default-600 truncate">
                {message.replyTo.text}
              </p>
            </CardBody>
          </Card>
        )}

        {/* Message Bubble */}
        <Card
          className={`relative ${
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-default-100 text-default-900"
          }`}
          shadow="none"
        >
          <CardBody className="px-4 py-3">
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.text}
            </p>

            {/* Mentions */}
            {mentionedNames.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {mentionedNames.map((name, index) => (
                  <Chip
                    key={index}
                    className="text-xs"
                    color={isOwn ? "default" : "primary"}
                    size="sm"
                    variant="flat"
                  >
                    @{name}
                  </Chip>
                ))}
              </div>
            )}

            {/* Message Status */}
            <div
              className={`flex items-center gap-1 mt-2 ${isOwn ? "justify-end" : "justify-start"}`}
            >
              {isOwn && (
                <span className="text-xs opacity-70">
                  {formatTime(message.createdAt)}
                </span>
              )}
              {message.isEdited && (
                <span className="text-xs opacity-60">(edited)</span>
              )}
            </div>
          </CardBody>

          {/* Action Buttons */}
          {showActions && (
            <div
              className={`absolute top-1 ${isOwn ? "left-1" : "right-1"} opacity-0 group-hover:opacity-100 transition-opacity`}
            >
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    className="bg-background/80 backdrop-blur-sm"
                    size="sm"
                    variant="flat"
                  >
                    <DotsThreeVertical size={14} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key="reply"
                    startContent={<ArrowBendDoubleUpLeft size={16} />}
                    onPress={handleReply}
                  >
                    Reply
                  </DropdownItem>
                  {isOwn ? (
                    <DropdownItem
                      key="edit"
                      startContent={<PencilSimple size={16} />}
                      onPress={handleEdit}
                    >
                      Edit
                    </DropdownItem>
                  ) : null}
                  {isOwn ? (
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      startContent={<Trash size={16} />}
                      onPress={handleDelete}
                    >
                      Delete
                    </DropdownItem>
                  ) : null}
                </DropdownMenu>
              </Dropdown>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
