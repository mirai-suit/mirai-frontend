import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  addToast,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "@phosphor-icons/react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createBoardSchema,
  BOARD_COLORS,
  COLUMN_TEMPLATES,
  type CreateBoardInput,
  type ColumnTemplate,
} from "../validations";
import { useCreateBoard } from "../api";
import { useBoardStore } from "../store";
import { useAuthStore } from "../../auth/store";
import { useOrgStore } from "../../../store/useOrgStore";

import { WithPermission } from "@/components/role-based-access";

// Form interface matching the exact requirements
interface BoardFormData {
  title: string;
  description?: string;
  color: string;
  organizationId: string;
  defaultColumns?: string[];
}

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { user } = useAuthStore();
  const { currentOrgId } = useOrgStore();
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<ColumnTemplate>("kanban");
  const [customColumns, setCustomColumns] = React.useState<string[]>([]);
  const [newColumnName, setNewColumnName] = React.useState("");

  const createBoardMutation = useCreateBoard();
  const { closeCreateBoardModal } = useBoardStore();

  // Get organizationId from URL params, fallback to global store, or empty string
  const organizationId = orgId || currentOrgId || "";

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BoardFormData>({
    resolver: zodResolver(createBoardSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      color: "#3B82F6",
      organizationId,
      defaultColumns: [...COLUMN_TEMPLATES.kanban],
    },
    mode: "onChange",
  });

  const selectedColor = watch("color");

  // Update organizationId when orgId changes
  React.useEffect(() => {
    if (organizationId) {
      setValue("organizationId", organizationId);
    }
  }, [organizationId, setValue]);

  // Update default columns when template changes
  React.useEffect(() => {
    if (selectedTemplate === "custom") {
      setValue("defaultColumns", customColumns);
    } else {
      setValue("defaultColumns", [...COLUMN_TEMPLATES[selectedTemplate]]);
    }
  }, [selectedTemplate, customColumns, setValue]);

  const handleAddCustomColumn = () => {
    if (newColumnName.trim() && customColumns.length < 10) {
      const updatedColumns = [...customColumns, newColumnName.trim()];

      setCustomColumns(updatedColumns);
      setNewColumnName("");
      if (selectedTemplate === "custom") {
        setValue("defaultColumns", updatedColumns);
      }
    }
  };

  const handleRemoveCustomColumn = (index: number) => {
    const updatedColumns = customColumns.filter((_, i) => i !== index);

    setCustomColumns(updatedColumns);
    if (selectedTemplate === "custom") {
      setValue("defaultColumns", updatedColumns);
    }
  };

  const onSubmit = async (data: BoardFormData) => {
    // Safety check: don't submit if we don't have an organizationId
    if (!organizationId) {
      addToast({
        title: "Error",
        description: "You must select an organization to create a board.",
        color: "warning",
      });

      return;
    }

    try {
      const result = await createBoardMutation.mutateAsync(
        data as CreateBoardInput,
      );

      // Close modal and reset form
      onClose();
      closeCreateBoardModal();
      reset();
      setCustomColumns([]);
      setSelectedTemplate("kanban");

      if (user?.id) {
        navigate(`/u/${user.id}/o/${organizationId}/b/${result.board.id}`);
      }
    } catch {
      // Error handling is already done in the mutation
    }
  };

  const handleClose = () => {
    onClose();
    closeCreateBoardModal();
    reset();
    setCustomColumns([]);
    setSelectedTemplate("kanban");
  };

  return (
    <Modal isOpen={isOpen} size="2xl" onClose={handleClose}>
      <ModalContent>
        <WithPermission
          fallback={
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-sm text-default-500">
                You don&apos;t have permission to create boards in this
                organization.
              </p>
            </div>
          }
          permission="createBoards"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">Create New Board</h2>
              <p className="text-sm text-default-500">
                Set up your project board with columns and preferences
              </p>
            </ModalHeader>

            <ModalBody className="gap-6">
              {/* Board Title */}
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <Input
                    {...field}
                    errorMessage={errors.title?.message}
                    isInvalid={!!errors.title}
                    label="Board Title"
                    variant="flat"
                  />
                )}
              />

              {/* Board Description */}
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    errorMessage={errors.description?.message}
                    isInvalid={!!errors.description}
                    label="Description"
                    placeholder="Brief description of the board"
                    variant="flat"
                  />
                )}
              />

              {/* Board Color */}
              <div className="space-y-3">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="board-color-input"
                >
                  Board Color
                </label>
                {/* Hidden input for accessibility */}
                <input
                  readOnly
                  aria-hidden="true"
                  id="board-color-input"
                  style={{ display: "none" }}
                  tabIndex={-1}
                  type="text"
                  value={selectedColor}
                />
                <div className="flex flex-wrap gap-2">
                  {BOARD_COLORS.map((color) => (
                    <button
                      key={color}
                      aria-label={`Select board color ${color}`}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      type="button"
                      onClick={() => setValue("color", color)}
                    />
                  ))}
                </div>
              </div>

              {/* Column Template */}
              <div className="space-y-3">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="column-template-select"
                >
                  Column Template
                </label>
                <Select
                  id="column-template-select"
                  selectedKeys={[selectedTemplate]}
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as ColumnTemplate;

                    setSelectedTemplate(selected);
                  }}
                >
                  <SelectItem key="kanban">Kanban</SelectItem>
                  <SelectItem key="scrum">Scrum</SelectItem>
                  <SelectItem key="simple">Simple</SelectItem>
                  <SelectItem key="detailed">Detailed</SelectItem>
                  <SelectItem key="custom">Custom Columns</SelectItem>
                </Select>
              </div>

              {/* Custom Columns */}
              <AnimatePresence>
                {selectedTemplate === "custom" && (
                  <motion.div
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3"
                    exit={{ opacity: 0, height: 0 }}
                    initial={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex gap-2">
                      <Input
                        placeholder="Column name"
                        value={newColumnName}
                        variant="bordered"
                        onChange={(e) => setNewColumnName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomColumn();
                          }
                        }}
                      />
                      <Button
                        isIconOnly
                        color="primary"
                        isDisabled={
                          !newColumnName.trim() || customColumns.length >= 10
                        }
                        variant="flat"
                        onPress={handleAddCustomColumn}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>

                    {customColumns.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {customColumns.map((column, index) => (
                          <Chip
                            key={index}
                            endContent={<X size={14} />}
                            variant="flat"
                            onClose={() => handleRemoveCustomColumn(index)}
                          >
                            {column}
                          </Chip>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-default-500">
                      {customColumns.length}/10 columns
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={handleClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                isDisabled={!organizationId}
                isLoading={createBoardMutation.isPending}
                type="submit"
              >
                Create Board
              </Button>
            </ModalFooter>
          </form>
        </WithPermission>
      </ModalContent>
    </Modal>
  );
};
