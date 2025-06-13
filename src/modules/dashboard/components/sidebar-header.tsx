import React from "react";
import {
  Avatar,
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
  Question,
  X,
  PaintBrushHousehold,
} from "@phosphor-icons/react";
import { NotificationPanel } from "./notification-panel";
import { Notification } from "../types/sidebar.type";
import { ThemeTabs } from "@/components/theme-switch";

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
  const [notificationCount, setNotificationCount] = React.useState(3);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: "1",
      type: "invite",
      title: "Team Invitation",
      message: "Tony Reichert requested to join your Acme organization.",
      timestamp: "2 minutes ago",
      isRead: false,
      avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=10",
      actionable: true,
    },
    {
      id: "2",
      type: "file_update",
      title: "File Modified",
      message: "Ben Berman modified the Brand logo file.",
      timestamp: "7 hours ago",
      isRead: false,
      avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=11",
    },
    {
      id: "3",
      type: "mention",
      title: "Post Interaction",
      message: "Jane Doe liked your post.",
      timestamp: "Yesterday",
      isRead: true,
      avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=12",
    },
  ]);

  const unreadCount = React.useMemo(() => {
    return notifications.filter((notification) => !notification.isRead).length;
  }, [notifications]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  return (
    <div className="h-16 border-b border-divider flex items-center justify-between px-3">
      {/* Logo Section */}
      <div className="flex items-center">
        {/* Mobile Close Button */}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="lg:hidden mr-2"
          onPress={onToggleMobile}
          aria-label="Close sidebar"
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
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <Popover
          isOpen={isNotificationOpen}
          onOpenChange={setIsNotificationOpen}
          placement="bottom-end"
        >
          <PopoverTrigger>
            <div>
              <Tooltip
                content={`${unreadCount} notifications`}
                placement="bottom"
              >
                <Badge
                  content={unreadCount}
                  color="danger"
                  size="sm"
                  isInvisible={unreadCount === 0}
                >
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    aria-label="Notifications"
                  >
                    <Bell
                      size={18}
                      weight={unreadCount > 0 ? "fill" : "regular"}
                    />
                  </Button>
                </Badge>
              </Tooltip>
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-80">
            <NotificationPanel
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onClose={() => setIsNotificationOpen(false)}
            />
          </PopoverContent>
        </Popover>

        {/* User Avatar with Dropdown */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button
              isIconOnly
              variant="light"
              className="rounded-full"
              aria-label="User menu"
            >
              <Avatar
                src="https://img.heroui.chat/image/avatar?w=200&h=200&u=1"
                size="sm"
                isBordered
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
              startContent={<PaintBrushHousehold size={18} />}
              className="p-0 pl-2 hover:!bg-transparent hover:!text-inherit focus:!bg-transparent active:!bg-transparent"
            >
              <div className=" flex items-center justify-end">
                <ThemeTabs size="sm" />
              </div>
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              startContent={<SignOut size={18} />}
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
              size="sm"
              variant="light"
              onPress={onCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <CaretRight size={18} /> : <CaretLeft size={18} />}
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
