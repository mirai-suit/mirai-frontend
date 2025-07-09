import React from "react";
import { Card, CardBody, Skeleton } from "@heroui/react";
import { motion } from "framer-motion";

export const AnalyticsLoadingState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-content1">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="w-16 h-4 rounded-lg" />
                  <Skeleton className="w-24 h-8 rounded-lg" />
                </div>
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Chart */}
        <Card className="bg-content1">
          <CardBody className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="w-32 h-6 rounded-lg" />
                <Skeleton className="w-20 h-8 rounded-lg" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton className="w-20 h-4 rounded-lg" />
                    <Skeleton className="w-16 h-4 rounded-lg ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Right Chart */}
        <Card className="bg-content1">
          <CardBody className="p-6">
            <div className="space-y-4">
              <Skeleton className="w-40 h-6 rounded-lg" />
              <Skeleton className="w-full h-64 rounded-lg" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Team Performance Section Skeleton */}
      <Card className="bg-content1">
        <CardBody className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-48 h-6 rounded-lg" />
              <Skeleton className="w-24 h-8 rounded-lg" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-32 h-4 rounded-lg" />
                    <div className="flex gap-4">
                      <Skeleton className="w-20 h-3 rounded-lg" />
                      <Skeleton className="w-20 h-3 rounded-lg" />
                      <Skeleton className="w-20 h-3 rounded-lg" />
                    </div>
                  </div>
                  <Skeleton className="w-16 h-6 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Recent Activity Skeleton */}
      <Card className="bg-content1">
        <CardBody className="p-6">
          <div className="space-y-4">
            <Skeleton className="w-32 h-6 rounded-lg" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="w-48 h-4 rounded-lg" />
                    <Skeleton className="w-24 h-3 rounded-lg" />
                  </div>
                  <Skeleton className="w-16 h-3 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export const AnalyticsErrorState: React.FC<{
  error: Error;
  onRetry: () => void;
}> = ({ error, onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <Card className="bg-danger-50 border-danger-200 max-w-md">
        <CardBody className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-danger-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-danger-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-danger-800 mb-2">
            Failed to Load Analytics
          </h3>
          <p className="text-danger-600 text-sm mb-4">
            {error.message ||
              "Something went wrong while loading the analytics data."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors"
          >
            Try Again
          </motion.button>
        </CardBody>
      </Card>
    </motion.div>
  );
};
