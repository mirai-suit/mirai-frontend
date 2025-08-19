import React, { useEffect } from "react";
import {
  Badge,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import {
  Bell,
  CaretLeft,
  CaretRight,
  Gear,
  SignOut,
  User,
  Users,
  ChartBar,
  X,
  PaintBrushHousehold,
} from "@phosphor-icons/react";
import Avatar from "boring-avatars";

import { NotificationPanel } from "./notification-panel";

import { ThemeTabs } from "@/components/theme-switch";
import { useAuthStore } from "@/modules/auth/store";
import { siteConfig } from "@/config/site";
import { authService } from "@/modules/auth/services";
import { useNotifications } from "../api";
import { useQueryClient } from "@tanstack/react-query";
import io from "socket.io-client";
import { Notification } from "../types/sidebar.type";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onCollapse: () => void;
  onToggleMobile: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isCollapsed,
  onCollapse,
  onToggleMobile,
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const user = useAuthStore((state) => state.user);
  const { data: notifications , isLoading } = useNotifications();
  const unreadCount = React.useMemo(() => {
    return notifications?.filter((notification) => !notification.read).length;
  }, [notifications]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    // Connect to socket
    const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:8000");

    socket.on("connect", () => {
      console.log("Socket connected!", socket.id);      
      // Join personal notification room
      // Register listener BEFORE joining room
      socket.on("notification:new", (notification : any) => {
        queryClient.setQueryData(["notifications"], (old: any) => [notification, ...(old || [])]);
        console.log("New notification received:", notification);
      });

      socket.emit("joinNotifications", user.id);
    });
    

    console.log("jiasd", notifications);

    // Cleanup on unmount
    return () => {
      socket.emit("leaveNotifications", user.id);
      socket.disconnect();
      console.log("Socket disconnected for user:", user.id);
    };
  }, [user?.id, queryClient]);

  // const handleMarkAsRead = (id: string) => {
  //   setNotifications((prev) =>
  //     prev.map((notification) =>
  //       notification.id === id
  //         ? { ...notification, read: true }
  //         : notification
  //     )
  //   );
  // };

  // const handleMarkAllAsRead = () => {
  //   setNotifications((prev) =>
  //     prev.map((notification) => ({ ...notification, read: true }))
  //   );
  // };

  




  return (
    <div className="h-16 border-divider flex items-center justify-between px-3">
      {/* Logo Section */}
      <div className="flex items-center">
        {/* Mobile Close Button */}
        <Button
          isIconOnly
          aria-label="Close sidebar"
          className="lg:hidden mr-2"
          size="sm"
          variant="light"
          onPress={onToggleMobile}
        >
          <X size={18} />
        </Button>

        {/* Logo */}
        {isCollapsed ? (
          <Tooltip content="MIRAI" placement="right">
            <div className="font-bold text-xl">M</div>
          </Tooltip>
        ) : (
          <div className="font-bold text-xl">MIRAI</div>
        )}
      </div>

      {/* User Section */}
      <div className="flex items-center gap-2" >
        {/* Notification Bell */}
        <Popover
          isOpen={isNotificationOpen}
          placement="bottom-end"
          onOpenChange={(open) => setIsNotificationOpen(open)}
          className="relative"
        >
          <PopoverTrigger>
            <div>
              <Tooltip
                content={`${unreadCount} notifications`}
                placement="bottom"
              >
                <Badge
                  color="danger"
                  content={unreadCount}
                  isInvisible={unreadCount === 0}
                  size="sm"
                >
                  <Button
                    isIconOnly
                    aria-label="Notifications"
                    size="sm"
                    variant="light"
                  >
                    <Bell
                      size={18}
                      // weight={unreadCount > 0 ? "fill" : "regular"}
                    />
                  </Button>
                </Badge>
              </Tooltip>
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-80">
            <NotificationPanel
              notifications={notifications || []}
              onClose={() => setIsNotificationOpen(false)}
              onMarkAllAsRead={() => {}}
              onMarkAsRead={() => {}}
            />
          </PopoverContent>
        </Popover>

        {/* User Avatar with Dropdown */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button
              isIconOnly
              aria-label="User menu"
              className="rounded-full"
              variant="light"
            >
              <Avatar
                colors={siteConfig.avatarColors?.beam}
                name={user?.firstName + " " + user?.lastName}
                size={siteConfig.avatarSize}
                variant="beam"
              />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions">
            <DropdownItem key="profile" startContent={<User size={18} />}>
              Profile
            </DropdownItem>
            <DropdownItem key="settings" startContent={<Gear size={18} />}>
              Settings
            </DropdownItem>
            <DropdownItem key="team" startContent={<Users size={18} />}>
              Team
            </DropdownItem>
            <DropdownItem key="analytics" startContent={<ChartBar size={18} />}>
              Analytics
            </DropdownItem>
            <DropdownItem
              key="THeme"
              className="p-0 pl-2 hover:!bg-transparent hover:!text-inherit focus:!bg-transparent active:!bg-transparent"
              startContent={<PaintBrushHousehold size={18} />}
            >
              <div className=" flex items-center justify-end">
                <ThemeTabs size="sm" />
              </div>
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              startContent={<SignOut size={18} />}
              onClick={() => authService.logout()}
            >
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {/* Collapse Button (Desktop Only) */}
        <div className="hidden lg:block">
          <Tooltip
            content={isCollapsed ? "Expand" : "Collapse"}
            placement="right"
          >
            <Button
              isIconOnly
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              size="sm"
              variant="light"
              onPress={onCollapse}
            >
              {isCollapsed ? <CaretRight size={18} /> : <CaretLeft size={18} />}
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
