import React from "react";
import { Skeleton } from "@heroui/react";

export const OrganizationSelectorSkeleton: React.FC = () => {
  return (
    <div className="space-y-2">
      <Skeleton className="w-full h-14 rounded-medium" />
    </div>
  );
};
