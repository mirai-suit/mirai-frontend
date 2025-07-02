import React from "react";
import { Button } from "@heroui/react";
import { ChatCircle } from "@phosphor-icons/react";

interface FloatingChatButtonProps {
  onPress: () => void;
  unreadCount?: number;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onPress,
  unreadCount = 0,
}) => {
  const handlePress = () => {
    console.log("Chat button clicked!"); // Debug log
    onPress();
  };

  return (
    <Button
      isIconOnly
      className="fixed bottom-6 right-6 z-50 h-14 w-14"
      // color="primary"
      variant="flat"
      radius="full"
      size="lg"
      onPress={handlePress}
    >
      <div className="relative">
        <ChatCircle size={24} />
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </div>
    </Button>
  );
};
