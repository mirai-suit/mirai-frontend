import React from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface ActivityTrendChartProps {
  data: Array<{
    date: string;
    tasksCompleted: number;
    tasksCreated: number;
  }>;
}

export const ActivityTrendChart: React.FC<ActivityTrendChartProps> = ({
  data,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-content1 p-3 rounded-lg shadow-lg border">
          <p className="font-medium text-foreground">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card isBlurred shadow="sm">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Activity Trend
            </h3>
            <Chip size="sm" variant="flat" color="primary">
              Last 7 Days
            </Chip>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--heroui-divider))"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="hsl(var(--heroui-foreground-500))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--heroui-foreground-500))"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="tasksCompleted"
                  stroke="hsl(var(--heroui-success))"
                  strokeWidth={3}
                  dot={{
                    fill: "hsl(var(--heroui-success))",
                    strokeWidth: 2,
                    r: 4,
                  }}
                  name="Tasks Completed"
                />
                <Line
                  type="monotone"
                  dataKey="tasksCreated"
                  stroke="hsl(var(--heroui-primary))"
                  strokeWidth={3}
                  dot={{
                    fill: "hsl(var(--heroui-primary))",
                    strokeWidth: 2,
                    r: 4,
                  }}
                  name="Tasks Created"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

interface TaskDistributionChartProps {
  data: Array<{
    status: string;
    count: number;
    color: string;
  }>;
}

export const TaskDistributionChart: React.FC<TaskDistributionChartProps> = ({
  data,
}) => {
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-content1 p-3 rounded-lg shadow-lg border">
          <p className="font-medium text-foreground">{data.status}</p>
          <p className="text-sm text-foreground-500">{data.count} tasks</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card isBlurred shadow="sm">
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Task Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-foreground-600">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

interface TeamPerformanceChartProps {
  data: Array<{
    teamName: string;
    completionRate: number;
    productivityScore: number;
    color: string;
  }>;
}

export const TeamPerformanceChart: React.FC<TeamPerformanceChartProps> = ({
  data,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-content1 p-3 rounded-lg shadow-lg border">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toFixed(1)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="bg-content1" isBlurred shadow="lg">
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Team Performance Overview
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--heroui-divider))"
                />
                <XAxis
                  dataKey="teamName"
                  stroke="hsl(var(--heroui-foreground-500))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--heroui-foreground-500))"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="completionRate"
                  fill="hsl(var(--heroui-success))"
                  name="Completion Rate"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="productivityScore"
                  fill="hsl(var(--heroui-primary))"
                  name="Productivity Score"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
