import React from "react";
import { Avatar, Button, Card } from "@heroui/react";
import { Gear, X, Circle } from "@phosphor-icons/react";
import { Notification } from "../types/sidebar.type";
import { motion } from "framer-motion";

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
    (notification) => !notification.isRead
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
              size="sm"
              variant="light"
              onPress={onMarkAllAsRead}
              className="text-xs text-primary"
            >
              Mark all as read
            </Button>
          )}
          {/* Close button - always visible */}
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={onClose}
            aria-label="Close notifications"
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
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              /* Dynamic styling: unread notifications have background highlight */
              className={`p-4 border-b border-divider hover:bg-default-50 cursor-pointer
                        ${!notification.isRead ? "bg-default-50" : ""}`}
              /* Mark notification as read when clicked */
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className="flex gap-3">
                {/* User avatar for the notification */}
                <Avatar
                  src={notification.avatar}
                  size="sm"
                  className="flex-shrink-0"
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
                        size={8}
                        weight="fill"
                        className="text-primary mt-1 flex-shrink-0"
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
                          size="sm"
                          color="primary"
                          variant="flat"
                          className="text-xs py-1 px-2 h-auto min-w-0"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          className="text-xs py-1 px-2 h-auto min-w-0"
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
          <Button variant="light" size="sm" className="text-primary text-xs">
            View all notifications
          </Button>
          {/* Settings button for notification preferences */}
          <Button
            isIconOnly
            variant="light"
            size="sm"
            aria-label="Notification settings"
          >
            <Gear size={16} />
          </Button>
        </div>
      )}
    </Card>
  );
};
