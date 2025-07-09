import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
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

interface AnimatedChartCardProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const AnimatedChartCard: React.FC<AnimatedChartCardProps> = ({
  title,
  children,
  delay = 0,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      <Card className="h-full">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold text-default-700">{title}</h3>
        </CardHeader>
        <CardBody className="pt-0">{children}</CardBody>
      </Card>
    </motion.div>
  );
};

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
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          stroke="#666"
          fontSize={12}
        />
        <YAxis stroke="#666" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          labelFormatter={(value) => formatDate(value)}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="tasksCompleted"
          stroke="#10B981"
          strokeWidth={3}
          dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
          name="Tasks Completed"
          activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="tasksCreated"
          stroke="#3B82F6"
          strokeWidth={3}
          dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
          name="Tasks Created"
          activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
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
    index,
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
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="count"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

interface TeamPerformanceBarChartProps {
  data: Array<{
    teamName: string;
    completionRate: number;
    productivityScore: number;
    color: string;
  }>;
}

export const TeamPerformanceBarChart: React.FC<
  TeamPerformanceBarChartProps
> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="teamName"
          stroke="#666"
          fontSize={12}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis stroke="#666" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value: number, name: string) => [
            `${value.toFixed(1)}${name.includes("Rate") ? "%" : ""}`,
            name,
          ]}
        />
        <Legend />
        <Bar
          dataKey="completionRate"
          fill="#10B981"
          name="Completion Rate (%)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="productivityScore"
          fill="#3B82F6"
          name="Productivity Score"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
