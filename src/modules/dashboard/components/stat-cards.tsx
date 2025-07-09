import React from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import { motion } from "framer-motion";
import {
  Users,
  UsersFour,
  ChartLineUp,
  Trophy,
  Clock,
  Target,
  TrendUp,
  TrendDown,
} from "@phosphor-icons/react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  icon: React.ReactNode;
  color: "primary" | "success" | "warning" | "danger" | "secondary";
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  delay = 0,
}) => {
  const colorConfig = {
    primary: {
      bg: "bg-primary-50",
      icon: "text-primary-600",
      border: "border-primary-200",
    },
    success: {
      bg: "bg-success-50",
      icon: "text-success-600",
      border: "border-success-200",
    },
    warning: {
      bg: "bg-warning-50",
      icon: "text-warning-600",
      border: "border-warning-200",
    },
    danger: {
      bg: "bg-danger-50",
      icon: "text-danger-600",
      border: "border-danger-200",
    },
    secondary: {
      bg: "bg-secondary-50",
      icon: "text-secondary-600",
      border: "border-secondary-200",
    },
  };

  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card
        className={`h-full border ${config.border} hover:shadow-lg transition-shadow duration-300`}
      >
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-default-600 mb-1">
                {title}
              </p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
                className="text-3xl font-bold text-default-900"
              >
                {value}
              </motion.p>
              {change && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: delay + 0.4 }}
                  className="flex items-center gap-1 mt-2"
                >
                  {change.type === "increase" ? (
                    <TrendUp size={16} className="text-success-600" />
                  ) : (
                    <TrendDown size={16} className="text-danger-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      change.type === "increase"
                        ? "text-success-600"
                        : "text-danger-600"
                    }`}
                  >
                    {change.value}%
                  </span>
                  <span className="text-sm text-default-500">
                    vs {change.period}
                  </span>
                </motion.div>
              )}
            </div>
            <motion.div
              initial={{ opacity: 0, rotate: -10 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: delay + 0.1 }}
              className={`p-3 rounded-full ${config.bg}`}
            >
              <div className={`${config.icon}`}>{icon}</div>
            </motion.div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    color: string;
    memberCount: number;
    completionRate?: number;
    productivityScore?: number;
  };
  rank?: number;
  delay?: number;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  rank,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-md transition-shadow duration-300">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {rank && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold text-sm">
                  {rank}
                </div>
              )}
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: team.color }}
              />
              <div>
                <h4 className="font-semibold text-default-900">{team.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Users size={14} className="text-default-500" />
                  <span className="text-sm text-default-600">
                    {team.memberCount} members
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              {team.completionRate !== undefined && (
                <Chip
                  size="sm"
                  color={
                    team.completionRate > 80
                      ? "success"
                      : team.completionRate > 60
                        ? "warning"
                        : "danger"
                  }
                  variant="flat"
                  className="mb-1"
                >
                  {team.completionRate.toFixed(0)}% Complete
                </Chip>
              )}
              {team.productivityScore !== undefined && (
                <p className="text-sm text-default-600">
                  Score: {team.productivityScore.toFixed(1)}
                </p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

interface RecentTeamCardProps {
  team: {
    id: string;
    name: string;
    color: string;
    memberCount: number;
    createdAt: string;
  };
  delay?: number;
}

export const RecentTeamCard: React.FC<RecentTeamCardProps> = ({
  team,
  delay = 0,
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-default-50 transition-colors duration-200"
    >
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: team.color }}
      />
      <div className="flex-1">
        <p className="font-medium text-default-900">{team.name}</p>
        <p className="text-sm text-default-600">
          {team.memberCount} members • {formatDate(team.createdAt)}
        </p>
      </div>
      <Chip size="sm" color="primary" variant="dot">
        New
      </Chip>
    </motion.div>
  );
};

// Predefined icons for different stat types
export const STAT_ICONS = {
  teams: <UsersFour size={24} />,
  members: <Users size={24} />,
  performance: <ChartLineUp size={24} />,
  completion: <Target size={24} />,
  productivity: <Trophy size={24} />,
  activity: <Clock size={24} />,
};
