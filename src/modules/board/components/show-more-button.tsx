import React from "react";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";

interface ShowMoreButtonProps {
  remainingCount: number;
  onExpand: () => void;
}

export const ShowMoreButton: React.FC<ShowMoreButtonProps> = ({
  remainingCount,
  onExpand,
}) => {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="text-center py-2"
      initial={{ opacity: 0 }}
    >
      <Button
        className="text-xs text-default-400"
        size="sm"
        variant="light"
        onPress={onExpand}
      >
        +{remainingCount} more boards
      </Button>
    </motion.div>
  );
};
