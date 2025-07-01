import React, { useState } from "react";
import { Card, CardBody, Tabs, Tab } from "@heroui/react";
import { Microphone, UploadSimple, Paperclip } from "@phosphor-icons/react";

import { VoiceRecorder } from "./voice-recorder";
import { FileUpload } from "./file-uploader";

interface TaskAttachmentsProps {
  onVoiceRecordingComplete: (recording: {
    blob: Blob;
    duration: number;
  }) => void;
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  voiceRecordings: Array<{ blob: Blob; duration: number }>;
}

export const TaskAttachments: React.FC<TaskAttachmentsProps> = ({
  onVoiceRecordingComplete,
  onFilesSelected,
  selectedFiles,
  voiceRecordings,
}) => {
  const [activeTab, setActiveTab] = useState("files");

  const allAttachments = [...selectedFiles, ...voiceRecordings];

  return (
    <Card>
      <CardBody className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Paperclip className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium">Attachments</h3>
          {allAttachments.length > 0 && (
            <span className="text-xs text-gray-500">
              ({allAttachments.length}{" "}
              {allAttachments.length === 1 ? "file" : "files"})
            </span>
          )}
        </div>

        <Tabs
          selectedKey={activeTab}
          size="sm"
          variant="underlined"
          onSelectionChange={(key) => setActiveTab(key as string)}
        >
          <Tab
            key="files"
            title={
              <div className="flex items-center gap-2">
                <UploadSimple className="w-4 h-4" />
                Files
              </div>
            }
          >
            <div className="mt-4">
              <FileUpload
                acceptedTypes={[
                  "image/*",
                  "application/pdf",
                  ".doc,.docx,.txt",
                ]}
                maxFiles={10}
                onFilesSelected={onFilesSelected}
              />
            </div>
          </Tab>

          <Tab
            key="voice"
            title={
              <div className="flex items-center gap-2">
                <Microphone className="w-4 h-4" />
                Voice Note
              </div>
            }
          >
            <div className="mt-4">
              <VoiceRecorder onRecordingComplete={onVoiceRecordingComplete} />

              {voiceRecordings.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Recorded Voice Notes:</h4>
                  {voiceRecordings.map((recording, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Microphone className="w-4 h-4 text-green-500" />
                          <span className="text-sm">
                            Voice Note {index + 1}
                          </span>
                          <span className="text-xs text-gray-500">
                            {Math.floor(recording.duration / 60)}:
                            {(recording.duration % 60)
                              .toString()
                              .padStart(2, "0")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  );
};
