import React from "react";
import { Spinner } from "@heroui/react";

interface TypingIndicatorProps {
  typingUsers: string[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
}) => {
  if (!typingUsers.length) return null;

  const typingText =
    typingUsers.length === 1
      ? "Someone is typing..."
      : `${typingUsers.length} people are typing...`;

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-default-500">
      <Spinner size="sm" variant="dots" />
      <span className="text-sm italic">{typingText}</span>
    </div>
  );
};
