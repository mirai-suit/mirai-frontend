import type { FC } from "react";

import { Button, Badge } from "@heroui/react";
import { ChatCircle } from "@phosphor-icons/react";

import { useChatStore } from "../store";

interface ChatFloatingButtonProps {
  boardId: string;
  unreadCount?: number;
}

export const ChatFloatingButton: FC<ChatFloatingButtonProps> = ({
  boardId: _boardId,
  unreadCount = 0,
}) => {
  const { toggleChat, isChatOpen } = useChatStore();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Badge
        className="border-2 border-background"
        color="danger"
        content={unreadCount > 0 ? unreadCount : undefined}
        isInvisible={unreadCount === 0}
        size="sm"
      >
        <Button
          aria-label={`${isChatOpen ? "Close" : "Open"} board chat`}
          className="h-14 w-14 shadow-lg"
          color={isChatOpen ? "primary" : "default"}
          isIconOnly
          size="lg"
          variant={isChatOpen ? "solid" : "flat"}
          onPress={toggleChat}
        >
          <ChatCircle size={24} weight={isChatOpen ? "fill" : "regular"} />
        </Button>
      </Badge>
    </div>
  );
};
