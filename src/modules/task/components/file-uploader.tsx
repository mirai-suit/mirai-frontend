import React, { useState } from "react";
import { Button, Card } from "@heroui/react";
import { UploadSimple, File, Image, Trash, X } from "@phosphor-icons/react";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = 10,
  acceptedTypes = ["image/*", "application/pdf", ".doc,.docx,.txt"],
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const totalFiles = selectedFiles.length + fileArray.length;

    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);

      return;
    }

    const newFiles = [...selectedFiles, ...fileArray];

    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);

    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const clearAll = () => {
    setSelectedFiles([]);
    onFilesSelected([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="w-4 h-4 text-blue-500" />;
    }

    return <File className="w-4 h-4 text-gray-500" />;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <UploadSimple className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop files here, or click to select
        </p>
        <input
          multiple
          accept={acceptedTypes.join(",")}
          className="hidden"
          id="file-upload"
          type="file"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <Button
          as="label"
          color="primary"
          htmlFor="file-upload"
          size="sm"
          variant="flat"
        >
          Choose Files
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Max {maxFiles} files, up to 3MB each
        </p>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">
              Selected Files ({selectedFiles.length})
            </h4>
            <Button color="danger" size="sm" variant="flat" onPress={clearAll}>
              <X className="w-3 h-3" />
              Clear All
            </Button>
          </div>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
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
                  onPress={() => removeFile(index)}
                >
                  <Trash className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
