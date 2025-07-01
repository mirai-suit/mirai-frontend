import React, { useState } from "react";
import { parseDate, getLocalTimeZone, today } from "@internationalized/date";
import { motion, AnimatePresence } from "framer-motion";
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
  Switch,
  DateRangePicker,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createTaskFormSchema,
  type CreateTaskFormInput,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "../validations";
import { type CreateTaskRequest } from "../types";
import { useCreateTask, useCreateTaskWithFiles } from "../api";

import { AssigneeSelect } from "./assignee-select";
import { VoiceRecorder } from "./voice-recorder";
import { FileUpload } from "./file-upload";

import { WithPermission } from "@/components/role-based-access";
import { useOrganizationMembers } from "@/modules/organization/api";
import { useOrgStore } from "@/store/useOrgStore";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  columnId: string;
  teamId?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  boardId,
  columnId,
  teamId,
}) => {
  const { currentOrg } = useOrgStore();
  const createTaskMutation = useCreateTask();
  const createTaskWithFilesMutation = useCreateTaskWithFiles();

  // File attachment state
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Get organization members for assignment
  const { data: membersResponse } = useOrganizationMembers(
    currentOrg?.id || ""
  );

  const organizationMembers = membersResponse?.members || [];

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateTaskFormInput>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: undefined,
      priority: undefined,
      order: 0,
      isRecurring: false,
      boardId,
      columnId,
      teamId,
      assigneeIds: [],
    },
    mode: "onChange",
  });

  // Watch the status field to conditionally show custom status input
  const selectedStatus = watch("status");

  const onSubmit = async (data: CreateTaskFormInput) => {
    try {
      // Convert form data to API request format
      const requestData: CreateTaskRequest = {
        title: data.title,
        description: data.description,
        status: data.status,
        customStatus: data.customStatus,
        startDate: data.dateRange?.start
          ? parseDate(data.dateRange.start)
              .toDate(getLocalTimeZone())
              .toISOString()
          : undefined,
        dueDate: data.dateRange?.end
          ? parseDate(data.dateRange.end)
              .toDate(getLocalTimeZone())
              .toISOString()
          : undefined,
        priority: data.priority,
        order: data.order || 0,
        isRecurring: data.isRecurring || false,
        boardId: data.boardId,
        columnId: data.columnId,
        teamId: data.teamId,
        assigneeIds: data.assigneeIds || [],
      };

      // Use different mutation based on whether files are attached
      if (attachedFiles.length > 0) {
        await createTaskWithFilesMutation.mutateAsync({
          data: requestData,
          files: attachedFiles,
        });
      } else {
        await createTaskMutation.mutateAsync(requestData);
      }

      handleClose();
    } catch {
      // Error handling is done in the mutation
    }
  };

  const handleClose = () => {
    reset();
    setAttachedFiles([]); // Clear attached files
    onClose();
  };

  // File handling functions
  const handleFileUpload = (files: File[]) => {
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const handleVoiceRecording = (recording: {
    blob: Blob;
    duration: number;
  }) => {
    // Convert blob to file
    const file = new File([recording.blob], `voice-note-${Date.now()}.webm`, {
      type: "audio/webm",
    });

    setAttachedFiles((prev) => [...prev, file]);
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal isOpen={isOpen} placement="center" size="3xl" onClose={handleClose}>
      <ModalContent>
        <WithPermission
          fallback={
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-sm text-default-500">
                You don&apos;t have permission to create tasks in this
                organization.
              </p>
            </div>
          }
          permission="createBoards"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader className="flex flex-col gap-1">
              Create New Task
            </ModalHeader>

            <ModalBody className="gap-4">
              {/* Task Title */}
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <Input
                    {...field}
                    errorMessage={errors.title?.message}
                    isInvalid={!!errors.title}
                    label="Task Title"
                    placeholder="Enter task title"
                    size="sm"
                    variant="flat"
                  />
                )}
              />

              {/* Task Description */}
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    errorMessage={errors.description?.message}
                    isInvalid={!!errors.description}
                    label="Description"
                    maxRows={4}
                    minRows={2}
                    placeholder="Enter task description (optional)"
                    size="sm"
                    variant="flat"
                  />
                )}
              />

              {/* First Row - Status, Priority, Recurring */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Task Status */}
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Status"
                      placeholder="Select status"
                      selectedKeys={field.value ? [field.value] : []}
                      size="sm"
                      variant="flat"
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0] as string;

                        field.onChange(selectedKey);
                      }}
                    >
                      {TASK_STATUSES.map((status) => (
                        <SelectItem key={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                {/* Task Priority */}
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Priority"
                      placeholder="Select priority"
                      selectedKeys={field.value ? [field.value] : []}
                      size="sm"
                      variant="flat"
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0] as string;

                        field.onChange(selectedKey);
                      }}
                    >
                      {TASK_PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                {/* Assignees Selection */}
                <AssigneeSelect
                  control={control}
                  organizationMembers={organizationMembers}
                />

                {/* Recurring Task */}
                <Controller
                  control={control}
                  name="isRecurring"
                  render={({ field }) => (
                    <div className="flex items-center gap-2 pt-2">
                      <Switch
                        isSelected={field.value}
                        size="sm"
                        onValueChange={field.onChange}
                      >
                        Recurring Task
                      </Switch>
                    </div>
                  )}
                />
              </div>

              {/* Custom Status Field with Animation */}
              <AnimatePresence>
                {selectedStatus === "CUSTOM" && (
                  <motion.div
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    initial={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Controller
                      control={control}
                      name="customStatus"
                      render={({ field }) => (
                        <Input
                          {...field}
                          errorMessage={errors.customStatus?.message}
                          isInvalid={!!errors.customStatus}
                          label="Custom Status"
                          placeholder="Enter custom status name"
                          size="sm"
                          variant="flat"
                        />
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Date Range Section - HeroUI DateRangePicker */}
              <Controller
                control={control}
                name="dateRange"
                render={({ field }) => (
                  <DateRangePicker
                    description="Select start and end dates for the task"
                    label="Task Duration"
                    minValue={today(getLocalTimeZone())}
                    size="sm"
                    value={
                      field.value?.start && field.value?.end
                        ? {
                            start: parseDate(field.value.start) as any,
                            end: parseDate(field.value.end) as any,
                          }
                        : undefined
                    }
                    variant="flat"
                    onChange={(range: any) => {
                      if (range && range.start && range.end) {
                        field.onChange({
                          start: range.start.toString(),
                          end: range.end.toString(),
                        });
                      } else {
                        field.onChange(undefined);
                      }
                    }}
                  />
                )}
              />

              {/* Attachments Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Attachments (Optional)
                </h4>
                {/* Voice Recorder */}
                <VoiceRecorder
                  onRecordingComplete={handleVoiceRecording}
                />{" "}
                {/* File Upload */}
                <FileUpload
                  selectedFiles={attachedFiles}
                  onFilesSelected={handleFileUpload}
                  onRemoveFile={handleRemoveFile}
                />
              </div>
            </ModalBody>

            <ModalFooter>
              <Button color="danger" variant="light" onPress={handleClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={createTaskMutation.isPending}
                type="submit"
              >
                Create Task
              </Button>
            </ModalFooter>
          </form>
        </WithPermission>
      </ModalContent>
    </Modal>
  );
};
