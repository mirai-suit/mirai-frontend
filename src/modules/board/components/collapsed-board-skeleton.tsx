import React from "react";
import { Skeleton } from "@heroui/react";

interface CollapsedBoardSkeletonProps {
  count?: number;
}

export const CollapsedBoardSkeleton: React.FC<CollapsedBoardSkeletonProps> = ({
  count = 3,
}) => {
  return (
    <div className="px-2 py-2">
      {/* Add button skeleton */}
      <Skeleton className="w-10 h-10 rounded mx-auto mb-2" />

      {/* Board list skeleton */}
      <div className="space-y-1">
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} className="w-10 h-10 rounded mx-auto" />
        ))}
      </div>
    </div>
  );
};
