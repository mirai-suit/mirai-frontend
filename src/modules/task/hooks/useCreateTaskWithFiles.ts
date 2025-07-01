import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToast } from "@heroui/react";

import {
  createTaskWithFiles,
  CreateTaskWithFilesData,
} from "../services/taskAttachment.service";

export const useCreateTaskWithFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskWithFilesData) => {
      return createTaskWithFiles(data);
    },
    onSuccess: (response) => {
      addToast({
        color: "success",
        title: "Success",
        description: "Task created successfully with attachments!",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });

      return response;
    },
    onError: (error: any) => {
      console.error("Task creation error:", error);
      addToast({
        color: "danger",
        title: "Error",
        description: error?.response?.data?.message || "Failed to create task",
      });
    },
  });
};
