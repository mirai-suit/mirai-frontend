// Re-export Organization from main types to maintain consistency
export type { Organization } from "./index";

export interface Board {
  id: string;
  name: string;
  color?: string;
  taskCount?: number;
}

export interface Notification {
  id: string;
  notification: string;
  read: boolean;
  userId?: string;
  teamId?: string;
  boardId?: string;
  createdAt: string;
}
