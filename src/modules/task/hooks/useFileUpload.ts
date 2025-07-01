import { useState, useCallback } from "react";

export interface FileAttachment {
  file: File;
  preview?: string;
  type: "image" | "document" | "voice" | "other";
}

interface UseFileUploadReturn {
  files: FileAttachment[];
  addFiles: (newFiles: File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  totalSize: number;
  error: string | null;
}

const MAX_FILES = 10;
const FILE_SIZE_LIMITS = {
  image: 2 * 1024 * 1024, // 2MB
  voice: 3 * 1024 * 1024, // 3MB
  document: 3 * 1024 * 1024, // 3MB
};

const ALLOWED_FILE_TYPES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  voice: ["audio/webm", "audio/mp3", "audio/wav", "audio/ogg", "audio/mpeg"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/csv",
  ],
};

const getFileType = (file: File): FileAttachment["type"] => {
  if (ALLOWED_FILE_TYPES.image.includes(file.type)) return "image";
  if (ALLOWED_FILE_TYPES.voice.includes(file.type)) return "voice";
  if (ALLOWED_FILE_TYPES.document.includes(file.type)) return "document";

  return "other";
};

const isFileTypeAllowed = (file: File): boolean => {
  const allAllowedTypes = [
    ...ALLOWED_FILE_TYPES.image,
    ...ALLOWED_FILE_TYPES.voice,
    ...ALLOWED_FILE_TYPES.document,
  ];

  return allAllowedTypes.includes(file.type);
};

const isFileSizeValid = (file: File): boolean => {
  const fileType = getFileType(file);

  if (fileType === "other") return false;

  const limit = FILE_SIZE_LIMITS[fileType];

  return file.size <= limit;
};

const createPreview = (file: File): Promise<string | undefined> => {
  return new Promise((resolve) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      resolve(undefined);
    }
  });
};

export const useFileUpload = (): UseFileUploadReturn => {
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    async (newFiles: File[]) => {
      setError(null);

      try {
        // Validate total file count
        if (files.length + newFiles.length > MAX_FILES) {
          setError(`Maximum ${MAX_FILES} files allowed`);

          return;
        }

        // Validate each file
        const invalidFiles = newFiles.filter(
          (file) => !isFileTypeAllowed(file) || !isFileSizeValid(file),
        );

        if (invalidFiles.length > 0) {
          const invalidFile = invalidFiles[0];

          if (!isFileTypeAllowed(invalidFile)) {
            setError(`File type ${invalidFile.type} is not supported`);
          } else {
            const fileType = getFileType(invalidFile);

            if (fileType === "other") {
              setError(`File type ${invalidFile.type} is not supported`);

              return;
            }

            const limit = FILE_SIZE_LIMITS[fileType];

            setError(
              `File ${invalidFile.name} exceeds ${Math.round(limit / 1024 / 1024)}MB limit`,
            );
          }

          return;
        }

        // Create file attachments with previews
        const attachments = await Promise.all(
          newFiles.map(async (file) => {
            const type = getFileType(file);
            const preview = await createPreview(file);

            return {
              file,
              preview,
              type,
            };
          }),
        );

        setFiles((prev) => [...prev, ...attachments]);
      } catch {
        setError("Failed to process files");
      }
    },
    [files.length],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];

      // Revoke preview URL if it exists
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }

      return newFiles;
    });
    setError(null);
  }, []);

  const clearFiles = useCallback(() => {
    // Revoke all preview URLs
    files.forEach((attachment) => {
      if (attachment.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
    });
    setFiles([]);
    setError(null);
  }, [files]);

  const totalSize = files.reduce(
    (total, attachment) => total + attachment.file.size,
    0,
  );

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    totalSize,
    error,
  };
};
