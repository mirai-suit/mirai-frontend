import { useState, useCallback } from "react";

export interface FileAttachment {
  file: File;
  preview?: string;
  type: "image" | "document" | "voice";
}

interface UseFileAttachmentsReturn {
  files: FileAttachment[];
  addFiles: (newFiles: File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  error: string | null;
}

const MAX_FILES = 10;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "audio/webm",
  "audio/mp3",
  "application/pdf",
  "text/plain",
];

const getFileType = (file: File): FileAttachment["type"] => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "voice";

  return "document";
};

export const useFileAttachments = (): UseFileAttachmentsReturn => {
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    async (newFiles: File[]) => {
      setError(null);

      if (files.length + newFiles.length > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed`);

        return;
      }

      const validFiles = newFiles.filter((file) =>
        ALLOWED_TYPES.includes(file.type),
      );

      if (validFiles.length !== newFiles.length) {
        setError("Some files have unsupported formats");

        return;
      }

      const attachments = await Promise.all(
        validFiles.map(async (file) => {
          const type = getFileType(file);
          let preview: string | undefined;

          if (type === "image") {
            preview = URL.createObjectURL(file);
          }

          return { file, preview, type };
        }),
      );

      setFiles((prev) => [...prev, ...attachments]);
    },
    [files.length],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];

      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }

      return newFiles;
    });
  }, []);

  const clearFiles = useCallback(() => {
    files.forEach((attachment) => {
      if (attachment.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
    });
    setFiles([]);
    setError(null);
  }, [files]);

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    error,
  };
};
