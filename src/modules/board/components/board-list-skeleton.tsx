import React from "react";
import { Card, Skeleton } from "@heroui/react";

interface BoardListSkeletonProps {
  count?: number;
}

export const BoardListSkeleton: React.FC<BoardListSkeletonProps> = ({
  count = 3,
}) => {
  const titleWidths = ["w-3/4", "w-2/3", "w-4/5", "w-1/2", "w-5/6"];

  return (
    <div className="space-y-1 pr-2">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="relative rounded-lg border border-transparent p-2"
        >
          <div className="flex items-start gap-3">
            {/* Board color skeleton */}
            <Skeleton className="w-4 h-4 rounded-sm flex-shrink-0" />

            <div className="flex-1 space-y-2">
              {/* Board title skeleton with varied width */}
              <Skeleton
                className={`h-4 ${titleWidths[index % titleWidths.length]} rounded`}
              />

              {/* Board metadata skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-12 rounded" />
                <div className="w-1 h-1 bg-default-300 rounded-full" />
                <Skeleton className="h-3 w-10 rounded" />
                <div className="w-1 h-1 bg-default-300 rounded-full" />
                <Skeleton className="h-3 w-8 rounded" />
              </div>
            </div>

            {/* Action button skeleton */}
            <Skeleton className="w-6 h-2 rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
};
