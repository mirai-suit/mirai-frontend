import React from "react";
import { Card, Button, Chip } from "@heroui/react";
import {
  File,
  Image,
  SpeakerHigh,
  Download,
  Trash,
} from "@phosphor-icons/react";

interface AttachmentDisplayProps {
  attachments: Array<{
    id: string;
    filename: string;
    fileSize: number;
    fileType: string;
    downloadUrl?: string;
    uploadedBy: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }>;
  onDelete?: (attachmentId: string) => void;
  showDeleteButton?: boolean;
}

export const AttachmentDisplay: React.FC<AttachmentDisplayProps> = ({
  attachments,
  onDelete,
  showDeleteButton = false,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "VOICE_NOTE":
        return <SpeakerHigh className="w-5 h-5 text-green-500" />;
      case "IMAGE":
        return <Image className="w-5 h-5 text-blue-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (fileType: string) => {
    switch (fileType) {
      case "VOICE_NOTE":
        return "Voice Note";
      case "IMAGE":
        return "Image";
      case "DOCUMENT":
        return "Document";
      default:
        return "File";
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case "VOICE_NOTE":
        return "success";
      case "IMAGE":
        return "primary";
      case "DOCUMENT":
        return "secondary";
      default:
        return "default";
    }
  };

  if (attachments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        No attachments
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attachments.map((attachment) => (
        <Card key={attachment.id} className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {getFileIcon(attachment.fileType)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {attachment.filename}
                  </p>
                  <Chip
                    color={getFileTypeColor(attachment.fileType) as any}
                    size="sm"
                    variant="flat"
                  >
                    {getFileTypeLabel(attachment.fileType)}
                  </Chip>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span>{formatFileSize(attachment.fileSize)}</span>
                  <span>•</span>
                  <span>
                    by {attachment.uploadedBy.firstName}{" "}
                    {attachment.uploadedBy.lastName}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {attachment.downloadUrl && (
                <Button
                  isIconOnly
                  as="a"
                  download={attachment.filename}
                  href={attachment.downloadUrl}
                  size="sm"
                  variant="flat"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
              {showDeleteButton && onDelete && (
                <Button
                  isIconOnly
                  color="danger"
                  size="sm"
                  variant="flat"
                  onPress={() => onDelete(attachment.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
