import React, { useRef } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import {
  Paperclip,
  Trash,
  FileImage,
  FileText,
  FilePdf,
} from "@phosphor-icons/react";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  maxFiles?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  maxFiles = 10,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    onFilesSelected(files);
    // Clear input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const mimeType = file.type;

    if (mimeType.startsWith("image/")) {
      return <FileImage className="w-5 h-5 text-blue-600" />;
    }
    if (mimeType === "application/pdf") {
      return <FilePdf className="w-5 h-5 text-red-600" />;
    }

    return <FileText className="w-5 h-5 text-gray-600" />;
  };

  return (
    <div className="space-y-3">
      <div>
        <input
          ref={fileInputRef}
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt,.csv,audio/*"
          className="hidden"
          type="file"
          onChange={handleFileSelect}
        />
        <Button
          color="default"
          isDisabled={selectedFiles.length >= maxFiles}
          startContent={<Paperclip className="w-4 h-4" />}
          variant="flat"
          onPress={() => fileInputRef.current?.click()}
        >
          Attach Files
        </Button>
        <p className="text-xs text-gray-500 mt-1">
          Max {maxFiles} files • Images (2MB), Documents (3MB), Audio (3MB)
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <Card key={`${file.name}-${index}`} className="bg-gray-50">
              <CardBody className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="flat"
                    onPress={() => onRemoveFile(index)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
