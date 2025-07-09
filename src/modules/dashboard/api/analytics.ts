import apiClient from "@/libs/axios/interceptor";
import { useQuery } from "@tanstack/react-query";

// Types for analytics data
export interface TeamOverviewData {
  totalTeams: number;
  activeTeams: number;
  totalMembers: number;
  activeMembers: number;
  recentTeams: Array<{
    id: string;
    name: string;
    color: string;
    memberCount: number;
    createdAt: string;
  }>;
}

export interface TeamPerformanceData {
  teamId: string;
  teamName: string;
  period: "WEEKLY" | "MONTHLY" | "QUARTERLY";
  periodStart: string;
  periodEnd: string;
  averageCompletionRate: number;
  averageProductivityScore: number;
  averageOnTimeDeliveryRate: number;
  totalTasksCompleted: number;
  totalTasksAssigned: number;
  activeMembers: number;
  totalMembers: number;
  members: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    metrics: {
      tasksAssigned: number;
      tasksCompleted: number;
      completionRate: number;
      productivityScore: number;
      onTimeDeliveryRate: number;
    };
    trend: "up" | "down" | "stable";
    rank: number;
  }>;
  insights: string[];
}

export interface OrganizationAnalytics {
  overview: TeamOverviewData;
  topPerformingTeams: Array<{
    teamId: string;
    teamName: string;
    color: string;
    completionRate: number;
    productivityScore: number;
    memberCount: number;
  }>;
  activityTrend: Array<{
    date: string;
    tasksCompleted: number;
    tasksCreated: number;
  }>;
  taskDistribution: Array<{
    status: string;
    count: number;
    color: string;
  }>;
}

// API functions
export const getOrganizationAnalytics = async (
  organizationId: string
): Promise<OrganizationAnalytics> => {
  // Get all teams for the organization
  const teamsResponse = await apiClient.get(
    `/team/organization/${organizationId}`
  );
  const teams = teamsResponse.data.data.teams || [];

  // Get performance data for each team
  const teamPerformancePromises = teams.map(async (team: any) => {
    try {
      const performanceResponse = await apiClient.get(
        `/team/${team.id}/performance?period=MONTHLY`
      );
      return {
        teamData: team,
        performance: performanceResponse.data.data.performance,
      };
    } catch (error) {
      console.warn(`Failed to get performance for team ${team.id}:`, error);
      return {
        teamData: team,
        performance: null,
      };
    }
  });

  const teamPerformanceData = await Promise.all(teamPerformancePromises);

  // Calculate overview statistics
  const totalTeams = teams.length;
  const activeTeams = teams.filter((team: any) => team.isActive).length;
  const totalMembers = teamPerformanceData.reduce(
    (sum, { performance }) => sum + (performance?.totalMembers || 0),
    0
  );
  const activeMembers = teamPerformanceData.reduce(
    (sum, { performance }) => sum + (performance?.activeMembers || 0),
    0
  );

  // Get recent teams (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentTeams = teams
    .filter((team: any) => new Date(team.createdAt) > thirtyDaysAgo)
    .slice(0, 5)
    .map((team: any) => ({
      id: team.id,
      name: team.name,
      color: team.color,
      memberCount: team.members?.length || 0,
      createdAt: team.createdAt,
    }));

  // Create top performing teams
  const topPerformingTeams = teamPerformanceData
    .filter(({ performance }) => performance)
    .sort(
      (a, b) =>
        (b.performance?.averageProductivityScore || 0) -
        (a.performance?.averageProductivityScore || 0)
    )
    .slice(0, 5)
    .map(({ teamData, performance }) => ({
      teamId: teamData.id,
      teamName: teamData.name,
      color: teamData.color,
      completionRate: performance?.averageCompletionRate || 0,
      productivityScore: performance?.averageProductivityScore || 0,
      memberCount: performance?.totalMembers || 0,
    }));

  // Mock activity trend data (since we don't have historical tracking yet)
  const activityTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().split("T")[0],
      tasksCompleted: Math.floor(Math.random() * 20) + 10,
      tasksCreated: Math.floor(Math.random() * 15) + 15,
    };
  });

  // Mock task distribution data
  const taskDistribution = [
    { status: "Completed", count: 45, color: "#10B981" },
    { status: "In Progress", count: 32, color: "#3B82F6" },
    { status: "To Do", count: 28, color: "#6B7280" },
    { status: "Overdue", count: 8, color: "#EF4444" },
  ];

  return {
    overview: {
      totalTeams,
      activeTeams,
      totalMembers,
      activeMembers,
      recentTeams,
    },
    topPerformingTeams,
    activityTrend,
    taskDistribution,
  };
};

export const getTeamPerformanceData = async (
  teamId: string,
  period: "WEEKLY" | "MONTHLY" | "QUARTERLY" = "MONTHLY"
): Promise<TeamPerformanceData> => {
  const response = await apiClient.get(
    `/team/${teamId}/performance?period=${period}`
  );
  return response.data.data.performance;
};

// React Query hooks
export const useOrganizationAnalytics = (organizationId: string) => {
  return useQuery({
    queryKey: ["organization-analytics", organizationId],
    queryFn: () => getOrganizationAnalytics(organizationId),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

export const useTeamPerformance = (
  teamId: string,
  period: "WEEKLY" | "MONTHLY" | "QUARTERLY" = "MONTHLY"
) => {
  return useQuery({
    queryKey: ["team-performance", teamId, period],
    queryFn: () => getTeamPerformanceData(teamId, period),
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });
};
