// Personal Performance Types
export interface PersonalMetrics {
  tasksAssigned: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksOverdue: number;
  completionRate: number;
  productivityScore: number;
  onTimeDeliveryRate: number;
  averageTaskCompletionHours: number;
  totalWorkingMinutes: number;
  activeDaysInPeriod: number;
  lastActiveDate?: string;
}

export interface TeamMetrics {
  teamId: string;
  teamName: string;
  teamColor: string;
  metrics: PersonalMetrics;
  rank?: number;
  trend: "up" | "down" | "stable";
}

export interface PersonalPerformanceData {
  userId: string;
  period: "WEEKLY" | "MONTHLY" | "QUARTERLY";
  periodStart: string;
  periodEnd: string;
  
  // Aggregated metrics across all teams
  overall: PersonalMetrics;
  
  // Individual team metrics
  teams: TeamMetrics[];
  
  // Insights and recommendations
  insights: Array<{
    type: "positive" | "warning" | "negative";
    title: string;
    description: string;
    actionRequired?: boolean;
  }>;
  
  // Achievement badge
  achievement: {
    title: string;
    level: "top" | "high" | "good" | "average" | "needs-improvement";
    description: string;
  };
}

// API Response Types
export interface GetPersonalPerformanceResponse {
  success: boolean;
  data: {
    performance: PersonalPerformanceData;
  };
}

// Period Selection Type
export type PerformancePeriod = "WEEKLY" | "MONTHLY" | "QUARTERLY";
