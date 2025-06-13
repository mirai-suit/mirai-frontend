export interface Organization {
  id: string;
  name: string;
  avatar?: string;
  folders: Folder[];
}

export interface Folder {
  id: string;
  name: string;
  icon?: string;
  boards: Board[];
  isExpanded?: boolean;
}

export interface Board {
  id: string;
  name: string;
  color?: string;
  taskCount?: number;
}

export interface Notification {
  id: string;
  type: "invite" | "mention" | "file_update" | "follow" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
  actionable?: boolean; // for invites with Accept/Decline buttons
}
