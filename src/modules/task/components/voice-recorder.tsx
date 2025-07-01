import React from "react";
import { Button, Progress } from "@heroui/react";
import { Microphone, Stop, Trash, Play } from "@phosphor-icons/react";

import { useVoiceRecorder } from "../hooks/useVoiceRecorder";

interface VoiceRecorderProps {
  onRecordingComplete: (recording: { blob: Blob; duration: number }) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
}) => {
  const {
    isRecording,
    recordingTime,
    recording,
    startRecording,
    stopRecording,
    deleteRecording,
    error,
  } = useVoiceRecorder();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSaveRecording = () => {
    if (recording) {
      onRecordingComplete({
        blob: recording.blob,
        duration: recording.duration,
      });
      deleteRecording();
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (recording) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Voice Note Recorded</p>
              <p className="text-xs text-gray-500">
                Duration: {formatTime(recording.duration)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="flat" onPress={handleSaveRecording}>
              Save
            </Button>
            <Button
              size="sm"
              variant="flat"
              color="danger"
              onPress={deleteRecording}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-700">Recording...</p>
              <p className="text-xs text-red-600">
                {formatTime(recordingTime)}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            color="danger"
            variant="solid"
            onPress={stopRecording}
          >
            <Stop className="w-4 h-4" />
            Stop
          </Button>
        </div>
        <Progress
          value={(recordingTime / 120) * 100}
          color="danger"
          className="mt-3"
          size="sm"
        />
      </div>
    );
  }

  return (
    <Button
      variant="flat"
      color="primary"
      startContent={<Microphone className="w-4 h-4" />}
      onPress={startRecording}
    >
      Record Voice Note
    </Button>
  );
};
