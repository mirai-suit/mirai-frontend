import React from "react";
import { User, ScrollShadow } from "@heroui/react";

import type { BoardUser } from "../types";

interface OnlineUsersProps {
  boardUsers: BoardUser[];
}

export const OnlineUsers: React.FC<OnlineUsersProps> = ({ boardUsers }) => {
  if (!boardUsers.length) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-default-500 uppercase tracking-wide">
        Team Members ({boardUsers.length})
      </span>
      <ScrollShadow
        orientation="horizontal"
        className="flex gap-2 pb-2"
        hideScrollBar
      >
        {boardUsers.map((user) => (
          <User
            key={user.id}
            name={`${user.firstName} ${user.lastName}`}
            description={user.email}
            avatarProps={{
              src: user.avatar,
              name: `${user.firstName} ${user.lastName}`,
              size: "sm",
            }}
            className="flex-shrink-0 min-w-0"
            classNames={{
              name: "text-sm font-medium",
              description: "text-xs text-default-500",
            }}
          />
        ))}
      </ScrollShadow>
    </div>
  );
};
