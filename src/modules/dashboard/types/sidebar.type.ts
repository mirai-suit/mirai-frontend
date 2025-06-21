// Re-export Organization from main types to maintain consistency
export type { Organization } from "./index";

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
