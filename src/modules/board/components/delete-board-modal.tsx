import type { Board } from "../types";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Trash, Warning } from "@phosphor-icons/react";

interface DeleteBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  board: Board | null;
  isDeleting: boolean;
}

export const DeleteBoardModal: React.FC<DeleteBoardModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  board,
  isDeleting,
}) => {
  if (!board) return null;

  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-danger/10">
            <Warning className="text-danger" size={18} />
          </div>
          <span>Delete Board</span>
        </ModalHeader>

        <ModalBody className="py-4">
          <div className="space-y-3">
            <p className="text-foreground">
              Are you sure you want to delete{" "}
              <span className="font-medium text-primary">
                &ldquo;{board.title}&rdquo;
              </span>
              ?
            </p>

            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-2">
                <Trash className="text-warning mt-0.5" size={16} />
                <div className="text-sm text-warning-600 dark:text-warning-400">
                  <p className="font-medium mb-1">
                    This board will be moved to trash
                  </p>
                  <p>
                    You can restore it later from the trash bin or permanently
                    delete it. All columns and tasks will be preserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button isDisabled={isDeleting} variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="danger"
            isLoading={isDeleting}
            startContent={!isDeleting ? <Trash size={16} /> : undefined}
            onPress={onConfirm}
          >
            {isDeleting ? "Moving to Trash..." : "Move to Trash"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
