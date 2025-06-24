import { Card, CardBody, Skeleton } from "@heroui/react";

export const ColumnSkeleton = () => {
  return (
    <Card className="w-80 h-fit min-h-[200px]">
      <CardBody className="p-4">
        {/* Column header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="w-24 h-4 rounded" />
          </div>
          <Skeleton className="w-6 h-6 rounded" />
        </div>

        {/* Task skeletons */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardBody className="p-3">
                <Skeleton className="w-full h-4 rounded mb-2" />
                <Skeleton className="w-2/3 h-3 rounded" />
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Add task button skeleton */}
        <Skeleton className="w-full h-8 rounded mt-3" />
      </CardBody>
    </Card>
  );
};

export const ColumnListSkeleton = () => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[1, 2, 3, 4].map((i) => (
        <ColumnSkeleton key={i} />
      ))}
    </div>
  );
};
