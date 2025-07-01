import React from "react";
import TaskAttachmentsView from "./task-attachments-view";
import { TaskAttachment } from "../services/taskAttachment.service";

// Mock data for testing
const mockAttachments: TaskAttachment[] = [
  {
    id: "1",
    filename: "test-voice-note.mp3",
    fileSize: 1024000,
    mimeType: "audio/mp3",
    fileType: "VOICE_NOTE",
    downloadUrl: "https://example.com/audio.mp3",
    uploadedBy: {
      id: "user1",
      firstName: "John",
      lastName: "Doe",
      avatar: "",
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    filename: "test-image.jpg",
    fileSize: 2048000,
    mimeType: "image/jpeg",
    fileType: "IMAGE",
    downloadUrl: "https://via.placeholder.com/400x300",
    uploadedBy: {
      id: "user1",
      firstName: "Jane",
      lastName: "Smith",
      avatar: "",
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    filename: "test-document.pdf",
    fileSize: 512000,
    mimeType: "application/pdf",
    fileType: "DOCUMENT",
    downloadUrl: "https://example.com/document.pdf",
    uploadedBy: {
      id: "user1",
      firstName: "Bob",
      lastName: "Wilson",
      avatar: "",
    },
    createdAt: new Date().toISOString(),
  },
];

export const TaskAttachmentsTest: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Task Attachments Test</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">With Mock Data:</h2>
        <TaskAttachmentsView attachments={mockAttachments} />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">With Empty Array:</h2>
        <TaskAttachmentsView attachments={[]} />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">With Voice Note Only:</h2>
        <TaskAttachmentsView attachments={[mockAttachments[0]]} />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">With Image Only:</h2>
        <TaskAttachmentsView attachments={[mockAttachments[1]]} />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">With Document Only:</h2>
        <TaskAttachmentsView attachments={[mockAttachments[2]]} />
      </div>
    </div>
  );
};

export default TaskAttachmentsTest;
