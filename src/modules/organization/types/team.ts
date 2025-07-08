// Team-related types
export interface TeamMember {
  id: string;
  userId: string;
  role: "LEADER" | "MEMBER";
  joinedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  performanceMetrics?: {
    id: string;
    period: string;
    tasksAssigned: number;
    tasksCompleted: number;
    tasksInProgress: number;
    tasksOverdue: number;
    completionRate: number;
    onTimeDeliveryRate: number;
    productivityScore: number;
    [key: string]: any;
  };
}

export interface TeamBoardAccess {
  id: string;
  board: {
    id: string;
    title: string;
    color: string;
    description?: string;
  };
  grantedAt: Date;
  grantedBy: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  color: string;
  objectives?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  leader?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  organization: {
    id: string;
    name: string;
  };
  members: TeamMember[];
  boardAccess: TeamBoardAccess[];
  _count?: {
    members: number;
    boardAccess: number;
  };
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  color?: string;
  leaderId: string;
  organizationId: string;
  memberIds: string[];
  boardIds?: string[];
  objectives?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  color?: string;
  leaderId?: string;
  objectives?: string;
  isActive?: boolean;
}

export interface TeamsListResponse {
  teams: Team[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TeamFormData {
  name: string;
  description: string;
  color: string;
  leaderId: string;
  memberIds: string[];
  boardIds: string[];
  objectives: string;
}

// Team colors for selection
export const TEAM_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#EC4899", // Pink
  "#6B7280", // Gray
] as const;

export type TeamColor = (typeof TEAM_COLORS)[number];
