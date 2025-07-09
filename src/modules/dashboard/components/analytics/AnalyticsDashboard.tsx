import React from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { motion } from "framer-motion";
import { Plus, Download, ArrowClockwise } from "@phosphor-icons/react";

import { useOrganizationAnalytics } from "../../api/analytics";
import { useOrgStore } from "@/store/useOrgStore";
import {
  AnalyticsLoadingState,
  AnalyticsErrorState,
} from "./AnalyticsLoadingState";
import { OverviewStats, TopPerformingTeams } from "./AnalyticsStats";
import {
  ActivityTrendChart,
  TaskDistributionChart,
  TeamPerformanceChart,
} from "./AnalyticsCharts";

interface RecentActivityItemProps {
  activity: {
    id: string;
    type: "team_created" | "member_added" | "task_completed";
    message: string;
    timestamp: string;
    teamName?: string;
    teamColor?: string;
  };
  delay?: number;
}

const RecentActivityItem: React.FC<RecentActivityItemProps> = ({
  activity,
  delay = 0,
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "team_created":
        return "🎉";
      case "member_added":
        return "👋";
      case "task_completed":
        return "✅";
      default:
        return "📋";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "team_created":
        return "success";
      case "member_added":
        return "primary";
      case "task_completed":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-content2 transition-colors"
    >
      <div className="flex-shrink-0">
        <Chip
          size="sm"
          variant="flat"
          color={getActivityColor(activity.type) as any}
          className="text-sm"
        >
          {getActivityIcon(activity.type)}
        </Chip>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-medium">
          {activity.message}
        </p>
        {activity.teamName && (
          <div className="flex items-center gap-1 mt-1">
            {activity.teamColor && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: activity.teamColor }}
              />
            )}
            <span className="text-xs text-foreground-500">
              {activity.teamName}
            </span>
          </div>
        )}
      </div>
      <div className="flex-shrink-0">
        <span className="text-xs text-foreground-400">
          {new Date(activity.timestamp).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
};

export const AnalyticsDashboard: React.FC = () => {
  const { currentOrg } = useOrgStore();
  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useOrganizationAnalytics(currentOrg?.id || "");

  if (isLoading) {
    return <AnalyticsLoadingState />;
  }

  if (error) {
    return <AnalyticsErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="bg-content1 max-w-md">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-default-100 rounded-full flex items-center justify-center">
              📊
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Analytics Data
            </h3>
            <p className="text-foreground-500 text-sm mb-4">
              Create some teams and start tracking performance to see analytics.
            </p>
            <Button color="primary" variant="flat">
              <Plus size={16} />
              Create Your First Team
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Mock recent activities (you can replace this with real data later)
  const recentActivities = [
    {
      id: "1",
      type: "team_created" as const,
      message: "New team 'Frontend Development' was created",
      timestamp: new Date().toISOString(),
      teamName: "Frontend Development",
      teamColor: "#3B82F6",
    },
    {
      id: "2",
      type: "member_added" as const,
      message: "John Doe joined the Design Team",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      teamName: "Design Team",
      teamColor: "#10B981",
    },
    {
      id: "3",
      type: "task_completed" as const,
      message: "Task 'User Authentication' was completed",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      teamName: "Backend Team",
      teamColor: "#F59E0B",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Team Analytics Dashboard
          </h1>
          <p className="text-foreground-500 mt-1">
            Track team performance and organizational insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="flat"
            color="default"
            size="sm"
            onPress={() => refetch()}
          >
            <ArrowClockwise size={16} />
            Refresh
          </Button>
          <Button variant="flat" color="primary" size="sm">
            <Download size={16} />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <OverviewStats data={analytics.overview} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskDistributionChart data={analytics.taskDistribution} />
        <ActivityTrendChart data={analytics.activityTrend} />
      </div>

      {/* Team Performance Chart */}
      <TeamPerformanceChart data={analytics.topPerformingTeams} />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Teams */}
        <TopPerformingTeams teams={analytics.topPerformingTeams} />

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card isBlurred shadow="sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Recent Activity
                </h3>
                <Chip size="sm" variant="flat" color="default">
                  Last 3 days
                </Chip>
              </div>
              <div className="space-y-2">
                {recentActivities.map((activity, index) => (
                  <RecentActivityItem
                    key={activity.id}
                    activity={activity}
                    delay={0.9 + index * 0.1}
                  />
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-4 pt-4 border-t border-divider"
              >
                <Button
                  variant="light"
                  color="primary"
                  size="sm"
                  className="w-full"
                >
                  View All Activity
                </Button>
              </motion.div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Recent Teams */}
      {analytics.overview.recentTeams.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="bg-content1" isBlurred shadow="sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Recently Created Teams
                </h3>
                <Chip size="sm" variant="flat" color="secondary">
                  Last 30 days
                </Chip>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.overview.recentTeams.map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card
                      className="bg-content2 hover:bg-content3 transition-colors"
                      isBlurred
                      shadow="sm"
                    >
                      <CardBody className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: team.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">
                              {team.name}
                            </h4>
                            <p className="text-sm text-foreground-500">
                              {team.memberCount} members
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
