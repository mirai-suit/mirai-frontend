import React from "react";
import { Button } from "@heroui/react";
import { Plus } from "@phosphor-icons/react";

interface NoteEmptyStateProps {
  hasFilters: boolean;
  onCreateNote: () => void;
}

export const NoteEmptyState: React.FC<NoteEmptyStateProps> = ({
  hasFilters,
  onCreateNote,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center">
      <div className="text-6xl mb-4">📝</div>
      {hasFilters ? (
        <>
          <h3 className="text-lg font-medium text-default-700 mb-2">
            No notes match your filters
          </h3>
          <p className="text-default-500 mb-4">
            Try adjusting your search or category filters
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-default-700 mb-2">
            No notes yet
          </h3>
          <p className="text-default-500 mb-4">
            Create your first note to get started
          </p>
          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onPress={onCreateNote}
          >
            Create Note
          </Button>
        </>
      )}
    </div>
  );
};
