import { useQuery } from "@tanstack/react-query";
import { performanceService } from "../services";

// React Query hooks
export const usePersonalPerformance = (
  userId: string,
  organizationId: string,
  period: "WEEKLY" | "MONTHLY" | "QUARTERLY" = "MONTHLY"
) => {
  return useQuery({
    queryKey: ["personal-performance", userId, organizationId, period],
    queryFn: () => performanceService.getPersonalPerformanceOverview(userId, organizationId, period),
    enabled: !!userId && !!organizationId,
    staleTime: 0, // Always fetch fresh data for real-time analytics
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
