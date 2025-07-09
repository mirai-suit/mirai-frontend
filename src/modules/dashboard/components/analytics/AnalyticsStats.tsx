import React from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import { motion } from "framer-motion";
import {
  Users,
  UsersThree,
  ChartLineUp,
  Target,
  TrendUp,
  TrendDown,
} from "@phosphor-icons/react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: "primary" | "success" | "warning" | "danger" | "secondary";
  trend?: {
    value: number;
    type: "up" | "down";
  };
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  delay = 0,
}) => {
  const colorClasses = {
    primary: "bg-primary-50 text-primary-600 border-primary-200",
    success: "bg-success-50 text-success-600 border-success-200",
    warning: "bg-warning-50 text-warning-600 border-warning-200",
    danger: "bg-danger-50 text-danger-600 border-danger-200",
    secondary: "bg-secondary-50 text-secondary-600 border-secondary-200",
  };

  const iconColorClasses = {
    primary: "text-primary-500 bg-primary-100",
    success: "text-success-500 bg-success-100",
    warning: "text-warning-500 bg-warning-100",
    danger: "text-danger-500 bg-danger-100",
    secondary: "text-secondary-500 bg-secondary-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className={`h-full ${colorClasses[color]} border-2`} shadow="sm">
        <CardBody className="p-6">
          <div className="flex items-center justify-between h-full">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground-600 mb-1">
                {title}
              </p>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: delay + 0.2, duration: 0.3 }}
              >
                <p className="text-2xl font-bold text-foreground-800 mb-1">
                  {typeof value === "number" ? value.toLocaleString() : value}
                </p>
              </motion.div>
              {subtitle && (
                <p className="text-xs text-foreground-500">{subtitle}</p>
              )}
              {trend && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 0.4 }}
                  className="flex items-center gap-1 mt-2"
                >
                  {trend.type === "up" ? (
                    <TrendUp size={14} className="text-success-500" />
                  ) : (
                    <TrendDown size={14} className="text-danger-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      trend.type === "up"
                        ? "text-success-600"
                        : "text-danger-600"
                    }`}
                  >
                    {Math.abs(trend.value)}%
                  </span>
                  <span className="text-xs text-foreground-400">
                    vs last month
                  </span>
                </motion.div>
              )}
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: delay + 0.1, duration: 0.4 }}
              className={`p-3 rounded-xl ${iconColorClasses[color]}`}
            >
              {icon}
            </motion.div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

interface OverviewStatsProps {
  data: {
    totalTeams: number;
    activeTeams: number;
    totalMembers: number;
    activeMembers: number;
  };
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({ data }) => {
  const stats = [
    {
      title: "Total Teams",
      value: data.totalTeams,
      subtitle: `${data.activeTeams} active teams`,
      icon: <UsersThree size={24} />,
      color: "primary" as const,
      trend: { value: 12, type: "up" as const },
    },
    {
      title: "Team Members",
      value: data.totalMembers,
      subtitle: `${data.activeMembers} active this week`,
      icon: <Users size={24} />,
      color: "success" as const,
      trend: { value: 8, type: "up" as const },
    },
    {
      title: "Avg Performance",
      value: "84%",
      subtitle: "Team productivity score",
      icon: <ChartLineUp size={24} />,
      color: "warning" as const,
      trend: { value: 3, type: "down" as const },
    },
    {
      title: "Goals Achieved",
      value: "76%",
      subtitle: "Monthly objectives",
      icon: <Target size={24} />,
      color: "secondary" as const,
      trend: { value: 15, type: "up" as const },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
};

interface TopTeamCardProps {
  team: {
    teamId: string;
    teamName: string;
    color: string;
    completionRate: number;
    productivityScore: number;
    memberCount: number;
  };
  rank: number;
  delay?: number;
}

export const TopTeamCard: React.FC<TopTeamCardProps> = ({
  team,
  rank,
  delay = 0,
}) => {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "warning"; // Gold
      case 2:
        return "default"; // Silver
      case 3:
        return "secondary"; // Bronze
      default:
        return "default";
    }
  };

  const getRankIcon = (rank: number) => {
    const icons = ["🥇", "🥈", "🥉"];
    return icons[rank - 1] || `#${rank}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.25 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card
        className="bg-content1 hover:bg-content2 transition-colors"
        isBlurred
        shadow="sm"
      >
        <CardBody className="p-4">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2, type: "spring" }}
              className="flex-shrink-0"
            >
              <Chip
                size="lg"
                variant="flat"
                color={getRankColor(rank)}
                className="font-bold"
              >
                {getRankIcon(rank)}
              </Chip>
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: team.color }}
                />
                <h4 className="font-semibold text-foreground truncate">
                  {team.teamName}
                </h4>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-foreground-500">Completion:</span>
                  <div className="font-medium text-success-600">
                    {team.completionRate.toFixed(0)}%
                  </div>
                </div>
                <div>
                  <span className="text-foreground-500">Productivity:</span>
                  <div className="font-medium text-primary-600">
                    {team.productivityScore.toFixed(0)}%
                  </div>
                </div>
                <div>
                  <span className="text-foreground-500">Members:</span>
                  <div className="font-medium text-foreground-700">
                    {team.memberCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

interface TopPerformingTeamsProps {
  teams: Array<{
    teamId: string;
    teamName: string;
    color: string;
    completionRate: number;
    productivityScore: number;
    memberCount: number;
  }>;
}

export const TopPerformingTeams: React.FC<TopPerformingTeamsProps> = ({
  teams,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card shadow="md" isBlurred>
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Top Performing Teams
            </h3>
            <Chip size="sm" variant="flat" color="success">
              This Month
            </Chip>
          </div>
          <div className="space-y-3">
            {teams.slice(0, 5).map((team, index) => (
              <TopTeamCard
                key={team.teamId}
                team={team}
                rank={index + 1}
                delay={0.7 + index * 0.1}
              />
            ))}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
