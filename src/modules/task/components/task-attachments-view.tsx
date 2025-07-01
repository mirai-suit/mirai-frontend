import React, { useState } from "react";
import {
  Card,
  CardBody,
  Tabs,
  Tab,
  Button,
  Image,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  FileAudio,
  FileImage,
  FileText,
  Download,
  Play,
  Pause,
  Eye,
  Calendar,
  User,
} from "@phosphor-icons/react";
import { useDateFormatter } from "@react-aria/i18n";

import { TaskAttachment } from "../services/taskAttachment.service";

interface TaskAttachmentsViewProps {
  attachments: TaskAttachment[];
}

interface VoicePlayerProps {
  attachment: TaskAttachment;
}

const VoicePlayer: React.FC<VoicePlayerProps> = ({ attachment }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  React.useEffect(() => {
    if (attachment.downloadUrl) {
      const audioElement = new Audio(attachment.downloadUrl);
      setAudio(audioElement);

      audioElement.addEventListener("loadedmetadata", () => {
        setDuration(audioElement.duration);
      });

      audioElement.addEventListener("timeupdate", () => {
        setCurrentTime(audioElement.currentTime);
      });

      audioElement.addEventListener("ended", () => {
        setIsPlaying(false);
      });

      return () => {
        audioElement.pause();
        audioElement.remove();
      };
    }
  }, [attachment.downloadUrl]);

  const togglePlay = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="w-full">
      <CardBody className="p-4">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            color="primary"
            variant="flat"
            onPress={togglePlay}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </Button>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{attachment.filename}</span>
              <span className="text-xs text-default-500">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="w-full bg-default-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Button
            isIconOnly
            variant="light"
            size="sm"
            as="a"
            href={attachment.downloadUrl}
            download
          >
            <Download size={16} />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

interface ImagePreviewProps {
  attachment: TaskAttachment;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ attachment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="cursor-pointer" onClick={() => setIsModalOpen(true)}>
        <CardBody className="p-2">
          <div className="relative">
            <Image
              alt={attachment.filename}
              className="w-full h-32 object-cover rounded-lg"
              src={attachment.downloadUrl}
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100">
              <Eye className="text-white" size={24} />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs font-medium truncate">
              {attachment.filename}
            </p>
            <p className="text-xs text-default-500">
              {(attachment.fileSize / 1024).toFixed(1)} KB
            </p>
          </div>
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-lg font-semibold">{attachment.filename}</h3>
              </ModalHeader>
              <ModalBody>
                <div className="flex justify-center">
                  <Image
                    alt={attachment.filename}
                    className="max-w-full h-auto"
                    src={attachment.downloadUrl}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  variant="light"
                  as="a"
                  href={attachment.downloadUrl}
                  download
                  startContent={<Download size={16} />}
                >
                  Download
                </Button>
                <Button onPress={onClose}>Close</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

interface DocumentPreviewProps {
  attachment: TaskAttachment;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ attachment }) => {
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word")) return "📝";
    if (mimeType.includes("text")) return "📄";
    if (mimeType.includes("csv")) return "📊";
    return "📁";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card className="w-full">
      <CardBody className="p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{getFileIcon(attachment.mimeType)}</div>
          <div className="flex-1">
            <p className="text-sm font-medium truncate">
              {attachment.filename}
            </p>
            <p className="text-xs text-default-500">
              {formatFileSize(attachment.fileSize)}
            </p>
          </div>
          <Button
            color="primary"
            variant="flat"
            size="sm"
            as="a"
            href={attachment.downloadUrl}
            download
            startContent={<Download size={16} />}
          >
            Download
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export const TaskAttachmentsView: React.FC<TaskAttachmentsViewProps> = ({
  attachments,
}) => {
  const dateFormatter = useDateFormatter({
    dateStyle: "short",
    timeStyle: "short",
  });

  // Debug: Log the attachments data
  React.useEffect(() => {
    console.log("TaskAttachmentsView received attachments:", attachments);
    console.log("Attachments length:", attachments?.length);
    if (attachments?.length > 0) {
      console.log("First attachment:", attachments[0]);
    }
  }, [attachments]);

  // Always show something for debugging
  console.log(
    "Rendering TaskAttachmentsView with:",
    attachments?.length || 0,
    "attachments"
  );

  if (!attachments || attachments.length === 0) {
    return (
      <div className="p-4">
        <h4 className="text-lg font-semibold mb-4">Attachments</h4>
        <Card>
          <CardBody className="text-center py-8">
            <FileText className="mx-auto text-default-300" size={48} />
            <p className="text-default-500 mt-2">No attachments found</p>
            <p className="text-xs text-default-400 mt-1">
              Debug: Received {attachments?.length || 0} attachments
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Categorize attachments
  const voiceNotes = attachments.filter(
    (att) => att.fileType === "VOICE_NOTE" || att.mimeType.startsWith("audio/")
  );
  const images = attachments.filter(
    (att) => att.fileType === "IMAGE" || att.mimeType.startsWith("image/")
  );
  const documents = attachments.filter(
    (att) =>
      att.fileType === "DOCUMENT" ||
      att.mimeType.includes("pdf") ||
      att.mimeType.includes("word") ||
      att.mimeType.includes("text") ||
      att.mimeType.includes("csv")
  );

  const tabsData = [
    {
      key: "all",
      title: "All",
      icon: <FileText size={16} />,
      count: attachments.length,
    },
    {
      key: "voice",
      title: "Voice Notes",
      icon: <FileAudio size={16} />,
      count: voiceNotes.length,
    },
    {
      key: "images",
      title: "Images",
      icon: <FileImage size={16} />,
      count: images.length,
    },
    {
      key: "documents",
      title: "Documents",
      icon: <FileText size={16} />,
      count: documents.length,
    },
  ];

  const renderAttachmentsByType = (type: string) => {
    let filteredAttachments = attachments;

    switch (type) {
      case "voice":
        filteredAttachments = voiceNotes;
        break;
      case "images":
        filteredAttachments = images;
        break;
      case "documents":
        filteredAttachments = documents;
        break;
      default:
        filteredAttachments = attachments;
    }

    if (filteredAttachments.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-default-500">No {type} attachments found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {type === "voice" && (
          <div className="space-y-3">
            {filteredAttachments.map((attachment) => (
              <div key={attachment.id}>
                <VoicePlayer attachment={attachment} />
                <div className="mt-2 text-xs text-default-500 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {attachment.uploadedBy.firstName}{" "}
                    {attachment.uploadedBy.lastName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {dateFormatter.format(new Date(attachment.createdAt))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {type === "images" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredAttachments.map((attachment) => (
              <div key={attachment.id}>
                <ImagePreview attachment={attachment} />
                <div className="mt-2 text-xs text-default-500">
                  <p className="flex items-center gap-1">
                    <User size={12} />
                    {attachment.uploadedBy.firstName}{" "}
                    {attachment.uploadedBy.lastName}
                  </p>
                  <p className="flex items-center gap-1">
                    <Calendar size={12} />
                    {dateFormatter.format(new Date(attachment.createdAt))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {(type === "documents" || type === "all") && (
          <div className="space-y-3">
            {(type === "all" ? attachments : filteredAttachments).map(
              (attachment) => {
                if (
                  attachment.fileType === "VOICE_NOTE" ||
                  attachment.mimeType.startsWith("audio/")
                ) {
                  return (
                    <div key={attachment.id}>
                      <VoicePlayer attachment={attachment} />
                      <div className="mt-2 text-xs text-default-500 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {attachment.uploadedBy.firstName}{" "}
                          {attachment.uploadedBy.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {dateFormatter.format(new Date(attachment.createdAt))}
                        </span>
                      </div>
                    </div>
                  );
                }

                if (
                  attachment.fileType === "IMAGE" ||
                  attachment.mimeType.startsWith("image/")
                ) {
                  return (
                    <div key={attachment.id} className="inline-block">
                      <ImagePreview attachment={attachment} />
                      <div className="mt-2 text-xs text-default-500">
                        <p className="flex items-center gap-1">
                          <User size={12} />
                          {attachment.uploadedBy.firstName}{" "}
                          {attachment.uploadedBy.lastName}
                        </p>
                        <p className="flex items-center gap-1">
                          <Calendar size={12} />
                          {dateFormatter.format(new Date(attachment.createdAt))}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={attachment.id}>
                    <DocumentPreview attachment={attachment} />
                    <div className="mt-2 text-xs text-default-500 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {attachment.uploadedBy.firstName}{" "}
                        {attachment.uploadedBy.lastName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {dateFormatter.format(new Date(attachment.createdAt))}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <h4 className="text-lg font-semibold mb-4">
        Attachments ({attachments.length})
      </h4>
      <Tabs
        aria-label="Attachment types"
        color="primary"
        variant="underlined"
        defaultSelectedKey="all"
        classNames={{
          tabList:
            "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12",
        }}
      >
        {tabsData.map((tab) => (
          <Tab
            key={tab.key}
            title={
              <div className="flex items-center gap-2">
                {tab.icon}
                <span>{tab.title}</span>
                {tab.count > 0 && (
                  <Chip size="sm" variant="flat" color="primary">
                    {tab.count}
                  </Chip>
                )}
              </div>
            }
          >
            <div className="py-4">{renderAttachmentsByType(tab.key)}</div>
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default TaskAttachmentsView;
