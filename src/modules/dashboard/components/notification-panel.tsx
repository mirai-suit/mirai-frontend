import React from "react";
import { Avatar, Button, Card } from "@heroui/react";
import { Gear, X, Circle } from "@phosphor-icons/react";
import { motion } from "framer-motion";

import { Notification } from "../types/sidebar.type";

/**
 * Props interface for the NotificationPanel component
 */
interface NotificationPanelProps {
  /** Array of notification objects to display */
  notifications: Notification[];
  /** Callback function to mark a specific notification as read */
  onMarkAsRead: (id: string) => void;
  /** Callback function to mark all notifications as read */
  onMarkAllAsRead: () => void;
  /** Callback function to close the notification panel */
  onClose: () => void;
}

/**
 * NotificationPanel Component
 *
 * A comprehensive notification panel that displays a list of notifications with the following features:
 * - Shows unread notification count in the header
 * - Allows marking individual notifications as read by clicking
 * - Provides "Mark all as read" functionality for bulk actions
 * - Displays actionable notifications with Accept/Decline buttons
 * - Includes a scrollable list for handling many notifications
 * - Responsive design with hover effects and animations
 */
export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}) => {
  // Calculate the number of unread notifications for the badge
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  return (
    <Card className="w-full shadow-none border-none">
      {/* ==================== HEADER SECTION ==================== */}
      {/* Contains title, unread count badge, mark all as read button, and close button */}
      <div className="flex items-center justify-between p-4 border-b border-divider">
        {/* Left side: Title and unread count badge */}
        <div className="flex items-center gap-2">
          <h3 className="text-medium font-semibold">Notifications</h3>
          {/* Show unread count badge only if there are unread notifications */}
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Right side: Action buttons */}
        <div className="flex items-center gap-2">
          {/* Show "Mark all as read" button only if there are unread notifications */}
          {unreadCount > 0 && (
            <Button
              className="text-xs text-primary"
              size="sm"
              variant="light"
              onPress={onMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
          {/* Close button - always visible */}
          <Button
            isIconOnly
            aria-label="Close notifications"
            size="sm"
            variant="light"
            onPress={onClose}
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* ==================== NOTIFICATION LIST SECTION ==================== */}
      {/* Scrollable container for all notifications with max height to prevent overflow */}
      <div className="max-h-96 overflow-y-auto">
        {/* Show empty state if no notifications */}
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-default-500">
            <p>No notifications</p>
          </div>
        ) : (
          /* Map through notifications and render each one */
          notifications.map((notification) => (
            <motion.div
              key={notification.id}
              animate={{ opacity: 1 }}
              className={`p-4 border-b border-divider hover:bg-default-50 cursor-pointer
                        ${!notification.isRead ? "bg-default-50" : ""}`}
              /* Mark notification as read when clicked */
              initial={{ opacity: 0.8 }}
              /* Dynamic styling: unread notifications have background highlight */
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className="flex gap-3">
                {/* User avatar for the notification */}
                <Avatar
                  className="flex-shrink-0"
                  size="sm"
                  src={notification.avatar}
                />
                <div className="flex-1 min-w-0">
                  {/* Top row: notification content and read status indicator */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {/* Notification title */}
                      <p className="text-small font-medium">
                        {notification.title}
                      </p>
                      {/* Notification message/description */}
                      <p className="text-xs text-default-500 mt-1">
                        {notification.message}
                      </p>
                    </div>
                    {/* Blue dot indicator for unread notifications */}
                    {!notification.isRead && (
                      <Circle
                        className="text-primary mt-1 flex-shrink-0"
                        size={8}
                        weight="fill"
                      />
                    )}
                  </div>

                  {/* Bottom row: timestamp and action buttons (if actionable) */}
                  <div className="flex items-center justify-between mt-2">
                    {/* When the notification was created/received */}
                    <span className="text-xs text-default-400">
                      {notification.timestamp}
                    </span>

                    {/* Action buttons for notifications that require user response */}
                    {notification.actionable && (
                      <div className="flex gap-2">
                        <Button
                          className="text-xs py-1 px-2 h-auto min-w-0"
                          color="primary"
                          size="sm"
                          variant="flat"
                        >
                          Accept
                        </Button>
                        <Button
                          className="text-xs py-1 px-2 h-auto min-w-0"
                          size="sm"
                          variant="light"
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ==================== FOOTER SECTION ==================== */}
      {/* Only show footer if there are notifications to avoid empty space */}
      {notifications.length > 0 && (
        <div className="p-3 flex items-center justify-between">
          {/* Link to view all notifications in a dedicated page */}
          <Button className="text-primary text-xs" size="sm" variant="light">
            View all notifications
          </Button>
          {/* Settings button for notification preferences */}
          <Button
            isIconOnly
            aria-label="Notification settings"
            size="sm"
            variant="light"
          >
            <Gear size={16} />
          </Button>
        </div>
      )}
    </Card>
  );
};
