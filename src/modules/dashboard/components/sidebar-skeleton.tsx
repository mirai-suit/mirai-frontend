import React from "react";
import { Skeleton } from "@heroui/react";

interface SidebarSkeletonProps {
  isCollapsed: boolean;
}

export const SidebarSkeleton: React.FC<SidebarSkeletonProps> = ({
  isCollapsed,
}) => {
  if (isCollapsed) {
    return (
      <div className="px-3 py-4 space-y-4">
        {/* Collapsed organization avatar skeleton */}
        <Skeleton className="w-10 h-10 rounded-full mx-auto" />
        {/* Collapsed board icons skeleton */}
        <div className="space-y-2">
          <Skeleton className="w-8 h-8 rounded mx-auto" />
          <Skeleton className="w-8 h-8 rounded mx-auto" />
          <Skeleton className="w-8 h-8 rounded mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 space-y-6">
      {/* Organization selector skeleton */}
      <div className="space-y-2">
        <Skeleton className="w-20 h-4 rounded" />
        <Skeleton className="w-full h-12 rounded-lg" />
      </div>

      {/* Boards section skeleton */}
      <div className="space-y-3">
        <Skeleton className="w-16 h-4 rounded" />

        {/* Board items skeleton */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="w-24 h-4 rounded" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="w-28 h-4 rounded" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="w-20 h-4 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
