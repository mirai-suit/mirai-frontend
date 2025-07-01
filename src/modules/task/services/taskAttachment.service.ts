import apiClient from "@/libs/axios/interceptor";

export interface CreateTaskWithFilesData {
  title: string;
  description?: string;
  columnId: string;
  assigneeIds?: string[];
  priority?: string;
  dueDate?: string;
  attachments?: File[];
}

export interface TaskAttachment {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  fileType: "VOICE_NOTE" | "IMAGE" | "DOCUMENT" | "VIDEO" | "OTHER";
  downloadUrl?: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
  columnId: string;
  attachments?: TaskAttachment[];
  assignees: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const createTaskWithFiles = async (
  data: CreateTaskWithFilesData,
): Promise<{ task: TaskResponse }> => {
  const formData = new FormData();

  // Add task data
  formData.append("title", data.title);
  if (data.description) formData.append("description", data.description);
  formData.append("columnId", data.columnId);
  if (data.priority) formData.append("priority", data.priority);
  if (data.dueDate) formData.append("dueDate", data.dueDate);

  // Add assignee IDs if provided
  if (data.assigneeIds && data.assigneeIds.length > 0) {
    data.assigneeIds.forEach((id) => formData.append("assigneeIds[]", id));
  }

  // Add files if provided
  if (data.attachments && data.attachments.length > 0) {
    data.attachments.forEach((file) => {
      formData.append("attachments", file);
    });
  }

  const response = await apiClient.post("/task", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getTaskById = async (
  taskId: string,
): Promise<{ task: TaskResponse }> => {
  const response = await apiClient.get(`/task/${taskId}`);

  return response.data;
};

export const getTaskAttachments = async (
  taskId: string,
): Promise<{ data: TaskAttachment[] }> => {
  const response = await apiClient.get(`/task/${taskId}/attachments`);

  return response.data;
};

export const deleteTaskAttachment = async (
  taskId: string,
  attachmentId: string,
): Promise<void> => {
  await apiClient.delete(`/task/${taskId}/attachments/${attachmentId}`);
};
