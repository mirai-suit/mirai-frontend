import { useState } from "react";
import { Card, CardBody, Select, SelectItem } from "@heroui/react";
import { ChartLineUp } from "@phosphor-icons/react";

import { useAuthStore } from "@/modules/auth/store";
import { useOrgStore } from "@/store/useOrgStore";
import { usePersonalPerformance } from "../api/personalPerformance";

const PerformancePage = () => {
    const { user } = useAuthStore();
    const { currentOrg } = useOrgStore();
    const [selectedPeriod, setSelectedPeriod] = useState<"WEEKLY" | "MONTHLY" | "QUARTERLY">("MONTHLY");

    const {
        data: performanceData,
        isLoading,
        error,
    } = usePersonalPerformance(
        user?.id || "",
        currentOrg?.id || "",
        selectedPeriod
    );

    // Debug logging
    console.log("🔍 [Performance Page] Current user:", user);
    console.log("🏢 [Performance Page] Current org:", currentOrg);
    console.log("📊 [Performance Page] Performance data:", performanceData);
    console.log("⚡ [Performance Page] Loading state:", isLoading);
    console.log("❌ [Performance Page] Error state:", error);

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center gap-3 mb-6">
                    <ChartLineUp size={32} className="text-primary" />
                    <h1 className="text-3xl font-bold">Performance Analytics</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardBody className="h-48 bg-default-100" />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center gap-3 mb-6">
                    <ChartLineUp size={32} className="text-primary" />
                    <h1 className="text-3xl font-bold">Performance Analytics</h1>
                </div>
                <Card className="border-danger">
                    <CardBody className="text-center py-12">
                        <p className="text-danger text-lg">Unable to load performance data</p>
                        <p className="text-default-500 mt-2">Please try again later or contact support</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    if (!performanceData) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center gap-3 mb-6">
                    <ChartLineUp size={32} className="text-primary" />
                    <h1 className="text-3xl font-bold">Performance Analytics</h1>
                </div>
                <Card>
                    <CardBody className="text-center py-12">
                        <p className="text-default-500 text-lg">No performance data available</p>
                        <p className="text-default-400 mt-2">Start completing tasks to see your analytics</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <ChartLineUp size={32} className="text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Performance Analytics</h1>
                        <p className="text-default-500">
                            Your personal productivity insights across all teams
                        </p>
                    </div>
                </div>

                {/* Period Selection */}
                <Select
                    size="sm"
                    variant="bordered"
                    label="Time Period"
                    selectedKeys={[selectedPeriod]}
                    className="w-48"
                    onSelectionChange={(keys) => {
                        const period = Array.from(keys)[0] as "WEEKLY" | "MONTHLY" | "QUARTERLY";
                        setSelectedPeriod(period);
                    }}
                >
                    <SelectItem key="WEEKLY">
                        This Week
                    </SelectItem>
                    <SelectItem key="MONTHLY">
                        This Month
                    </SelectItem>
                    <SelectItem key="QUARTERLY">
                        This Quarter
                    </SelectItem>
                </Select>
            </div>

            {/* Quick Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Productivity Score */}
                <Card>
                    <CardBody className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">
                            {performanceData.overall.productivityScore.toFixed(1)}
                        </div>
                        <div className="text-default-500 text-sm">Productivity Score</div>
                        <div className="text-xs text-default-400 mt-1">
                            {performanceData.achievement.title}
                        </div>
                    </CardBody>
                </Card>

                {/* Completion Rate */}
                <Card>
                    <CardBody className="text-center">
                        <div className="text-3xl font-bold text-success mb-2">
                            {performanceData.overall.completionRate.toFixed(1)}%
                        </div>
                        <div className="text-default-500 text-sm">Completion Rate</div>
                        <div className="text-xs text-default-400 mt-1">
                            {performanceData.overall.tasksCompleted} of {performanceData.overall.tasksAssigned} tasks
                        </div>
                    </CardBody>
                </Card>

                {/* Tasks in Progress */}
                <Card>
                    <CardBody className="text-center">
                        <div className="text-3xl font-bold text-warning mb-2">
                            {performanceData.overall.tasksInProgress}
                        </div>
                        <div className="text-default-500 text-sm">Tasks in Progress</div>
                        <div className="text-xs text-default-400 mt-1">
                            Active workload
                        </div>
                    </CardBody>
                </Card>

                {/* Overdue Tasks */}
                <Card>
                    <CardBody className="text-center">
                        <div className={`text-3xl font-bold mb-2 ${performanceData.overall.tasksOverdue > 0 ? 'text-danger' : 'text-success'
                            }`}>
                            {performanceData.overall.tasksOverdue}
                        </div>
                        <div className="text-default-500 text-sm">Overdue Tasks</div>
                        <div className="text-xs text-default-400 mt-1">
                            {performanceData.overall.tasksOverdue === 0 ? 'Great job!' : 'Needs attention'}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Insights Section */}
            {performanceData.insights.length > 0 && (
                <Card className="mb-8">
                    <CardBody>
                        <h3 className="text-xl font-semibold mb-4">Personal Insights</h3>
                        <div className="space-y-3">
                            {performanceData.insights.map((insight, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg border-l-4 ${insight.type === "positive"
                                        ? "bg-success-50 border-success"
                                        : insight.type === "warning"
                                            ? "bg-warning-50 border-warning"
                                            : "bg-danger-50 border-danger"
                                        }`}
                                >
                                    <div className="font-semibold text-sm">{insight.title}</div>
                                    <div className="text-sm text-default-600 mt-1">{insight.description}</div>
                                    {insight.actionRequired && (
                                        <div className="text-xs text-default-500 mt-2">Action Required</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Team Breakdown */}
            {performanceData.teams.length > 0 && (
                <Card>
                    <CardBody>
                        <h3 className="text-xl font-semibold mb-4">Performance by Team</h3>
                        <div className="space-y-4">
                            {performanceData.teams.map((team) => (
                                <div
                                    key={team.teamId}
                                    className="p-4 border rounded-lg"
                                    style={{ borderColor: team.teamColor + '40' }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded"
                                                style={{ backgroundColor: team.teamColor }}
                                            />
                                            <h4 className="font-semibold">{team.teamName}</h4>
                                        </div>
                                        <div className="text-sm text-default-500">
                                            Score: {team.metrics.productivityScore.toFixed(1)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <div className="text-default-500">Assigned</div>
                                            <div className="font-semibold">{team.metrics.tasksAssigned}</div>
                                        </div>
                                        <div>
                                            <div className="text-default-500">Completed</div>
                                            <div className="font-semibold">{team.metrics.tasksCompleted}</div>
                                        </div>
                                        <div>
                                            <div className="text-default-500">Completion Rate</div>
                                            <div className="font-semibold">{team.metrics.completionRate.toFixed(1)}%</div>
                                        </div>
                                        <div>
                                            <div className="text-default-500">Avg Hours</div>
                                            <div className="font-semibold">{team.metrics.averageTaskCompletionHours.toFixed(1)}h</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

export default PerformancePage;
