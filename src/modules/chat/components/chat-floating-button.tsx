import React from "react";
import { Button, Badge } from "@heroui/react";
import { ChatCircle } from "@phosphor-icons/react";

import { useChatStore } from "../store";

interface ChatFloatingButtonProps {
  unreadCount?: number;
}

export const ChatFloatingButton: React.FC<ChatFloatingButtonProps> = ({
  unreadCount = 0,
}) => {
  const { openChat } = useChatStore();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Badge
        color="danger"
        content={unreadCount > 0 ? unreadCount : undefined}
        isInvisible={unreadCount === 0}
        placement="top-right"
        size="md"
      >
        <Button
          isIconOnly
          className="h-14 w-14 min-w-0 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          color="primary"
          size="lg"
          onPress={openChat}
        >
          <ChatCircle size={24} weight="fill" />
        </Button>
      </Badge>
    </div>
  );
};
