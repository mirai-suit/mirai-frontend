import type {
  PersonalPerformanceData,
  PersonalMetrics,
  TeamMetrics,
} from "../types";

import apiClient from "@/libs/axios/interceptor";

export const performanceService = {
  // Get personal performance overview across all teams
  async getPersonalPerformanceOverview(
    userId: string,
    organizationId: string,
    period: "WEEKLY" | "MONTHLY" | "QUARTERLY" = "MONTHLY"
  ): Promise<PersonalPerformanceData> {
    console.log("🔍 [Frontend] Getting performance for:", { 
      userId: userId.slice(0,8), 
      orgId: organizationId.slice(0,8), 
      period 
    });

    // Get all teams user belongs to in this organization
    const teamsResponse = await apiClient.get(
      `/team/organization/${organizationId}`
    );
    const allTeams = teamsResponse.data.data.teams || [];
    
    console.log("📊 [Frontend] Teams in org:", allTeams.length);
    
    // Filter teams where user is a member
    const userTeams = allTeams.filter((team: any) => 
      team.members?.some((member: any) => member.userId === userId)
    );

    console.log("👤 [Frontend] User teams:", userTeams.length, "teams");

    // Get performance metrics for each team (limit to first 3 teams for testing)
    const testTeams = userTeams.slice(0, 3);
    const teamMetricsPromises = testTeams.map(async (team: any) => {
      try {
        console.log(`📈 [Frontend] Fetching ${team.name.slice(0,15)}...`);
        
        const metricsResponse = await apiClient.get(
          `/performance/user/${userId}/team/${team.id}/metrics`,
          { params: { period } }
        );
        
        console.log(`✅ [Frontend] ${team.name.slice(0,15)}: ${metricsResponse.data.metrics ? 'HAS DATA' : 'NO DATA'}`);
        
        return {
          teamId: team.id,
          teamName: team.name,
          teamColor: team.color,
          metrics: metricsResponse.data.metrics || {
            tasksAssigned: 0,
            tasksCompleted: 0,
            tasksInProgress: 0,
            tasksOverdue: 0,
            completionRate: 0,
            productivityScore: 0,
            onTimeDeliveryRate: 0,
            averageTaskCompletionHours: 0,
            totalWorkingMinutes: 0,
            activeDaysInPeriod: 0,
          },
          trend: "stable" as const,
        };
      } catch (error) {
        console.error(`❌ [Frontend] ${team.name}: ERROR`);
        return {
          teamId: team.id,
          teamName: team.name,
          teamColor: team.color,
          metrics: {
            tasksAssigned: 0,
            tasksCompleted: 0,
            tasksInProgress: 0,
            tasksOverdue: 0,
            completionRate: 0,
            productivityScore: 0,
            onTimeDeliveryRate: 0,
            averageTaskCompletionHours: 0,
            totalWorkingMinutes: 0,
            activeDaysInPeriod: 0,
          },
          trend: "stable" as const,
        };
      }
    });

    const teamMetrics = await Promise.all(teamMetricsPromises);

    console.log("📊 [Frontend] Final metrics:", teamMetrics.length, "teams processed");

    // Calculate aggregated metrics across all teams
    const validMetrics = teamMetrics.filter(team => team.metrics);
    const totalTeams = validMetrics.length;

    console.log("🔢 [Frontend] Valid metrics:", validMetrics.length, "teams with data");

    const overall: PersonalMetrics = {
      tasksAssigned: validMetrics.reduce((sum, team) => sum + team.metrics.tasksAssigned, 0),
      tasksCompleted: validMetrics.reduce((sum, team) => sum + team.metrics.tasksCompleted, 0),
      tasksInProgress: validMetrics.reduce((sum, team) => sum + team.metrics.tasksInProgress, 0),
      tasksOverdue: validMetrics.reduce((sum, team) => sum + team.metrics.tasksOverdue, 0),
      totalWorkingMinutes: validMetrics.reduce((sum, team) => sum + team.metrics.totalWorkingMinutes, 0),
      activeDaysInPeriod: Math.max(...validMetrics.map(team => team.metrics.activeDaysInPeriod), 0),
      lastActiveDate: validMetrics
        .map(team => team.metrics.lastActiveDate)
        .filter(Boolean)
        .sort()
        .pop(),
      completionRate: 0,
      productivityScore: 0,
      onTimeDeliveryRate: 0,
      averageTaskCompletionHours: 0,
    };

    // Calculate derived metrics
    overall.completionRate = overall.tasksAssigned > 0 
      ? (overall.tasksCompleted / overall.tasksAssigned) * 100 
      : 0;

    overall.productivityScore = totalTeams > 0
      ? validMetrics.reduce((sum, team) => sum + team.metrics.productivityScore, 0) / totalTeams
      : 0;

    overall.onTimeDeliveryRate = totalTeams > 0
      ? validMetrics.reduce((sum, team) => sum + team.metrics.onTimeDeliveryRate, 0) / totalTeams
      : 0;

    overall.averageTaskCompletionHours = totalTeams > 0
      ? validMetrics.reduce((sum, team) => sum + team.metrics.averageTaskCompletionHours, 0) / totalTeams
      : 0;

    // Generate achievement badge
    const achievement = this.getAchievementForScore(overall.productivityScore);

    // Generate personal insights
    const insights = this.generatePersonalInsights(overall, teamMetrics);

    // Get period range
    const periodRange = this.getPeriodRange(period);

    console.log("🎯 [Frontend] Final result:", {
      teamsProcessed: teamMetrics.length,
      teamsWithData: validMetrics.length,
      totalTasks: overall.tasksAssigned,
      completedTasks: overall.tasksCompleted,
      productivityScore: overall.productivityScore.toFixed(1)
    });

    return {
      userId,
      period,
      periodStart: periodRange.start.toISOString(),
      periodEnd: periodRange.end.toISOString(),
      overall,
      teams: teamMetrics,
      insights,
      achievement,
    };
  },

  // Helper methods
  getPeriodRange(period: "WEEKLY" | "MONTHLY" | "QUARTERLY") {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (period) {
      case "WEEKLY":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "MONTHLY":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "QUARTERLY":
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), quarterStart, 1);
        break;
    }

    return { start, end };
  },

  getAchievementForScore(score: number) {
    if (score >= 90) {
      return {
        title: "Top Performer",
        level: "top" as const,
        description: "Outstanding performance across all metrics!",
      };
    } else if (score >= 80) {
      return {
        title: "High Performer",
        level: "high" as const,
        description: "Excellent work quality and consistency.",
      };
    } else if (score >= 70) {
      return {
        title: "Good Performer",
        level: "good" as const,
        description: "Solid performance with room for improvement.",
      };
    } else if (score >= 60) {
      return {
        title: "Average Performer",
        level: "average" as const,
        description: "Meeting expectations, consider optimizing workflow.",
      };
    } else {
      return {
        title: "Developing",
        level: "needs-improvement" as const,
        description: "Focus on improving task completion and efficiency.",
      };
    }
  },

  generatePersonalInsights(overall: PersonalMetrics, teams: TeamMetrics[]) {
    const insights = [];

    // Productivity insights
    if (overall.productivityScore >= 80) {
      insights.push({
        type: "positive" as const,
        title: "Excellent Productivity",
        description: `Your productivity score of ${overall.productivityScore.toFixed(1)} is outstanding!`,
        actionRequired: false,
      });
    } else if (overall.productivityScore < 60) {
      insights.push({
        type: "negative" as const,
        title: "Productivity Needs Attention",
        description: `Your productivity score is ${overall.productivityScore.toFixed(1)}. Consider reviewing your workflow.`,
        actionRequired: true,
      });
    }

    // Task completion insights
    if (overall.completionRate < 70) {
      insights.push({
        type: "warning" as const,
        title: "Low Completion Rate",
        description: `You're completing ${overall.completionRate.toFixed(1)}% of assigned tasks. Focus on prioritization.`,
        actionRequired: true,
      });
    }

    // Time efficiency insights
    if (overall.averageTaskCompletionHours > 8) {
      insights.push({
        type: "warning" as const,
        title: "Time Efficiency Opportunity",
        description: `Tasks are taking ${overall.averageTaskCompletionHours.toFixed(1)} hours on average. Consider breaking down complex tasks.`,
        actionRequired: true,
      });
    }

    // Overdue tasks insight
    if (overall.tasksOverdue > 0) {
      insights.push({
        type: "negative" as const,
        title: "Overdue Tasks",
        description: `You have ${overall.tasksOverdue} overdue tasks. Prioritize these immediately.`,
        actionRequired: true,
      });
    }

    // Multi-team performance insight
    if (teams.length > 1) {
      const bestTeam = teams.reduce((best, current) => 
        current.metrics.productivityScore > best.metrics.productivityScore ? current : best
      );
      
      insights.push({
        type: "positive" as const,
        title: "Multi-Team Excellence",
        description: `You're performing well across ${teams.length} teams. Best performance in ${bestTeam.teamName}.`,
        actionRequired: false,
      });
    }

    return insights;
  },
};
