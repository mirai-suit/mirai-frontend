// Chat Message Types
export interface Message {
  id: string;
  text: string;
  senderId: string;
  threadId: string;
  messageType: "text" | "file" | "image" | "system";
  attachments?: any;
  replyToId?: string;
  replyTo?: Message;
  replies?: Message[];
  mentionedUsers: string[];
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  reactions?: any;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

// Message Thread Types
export interface MessageThread {
  id: string;
  boardId?: string;
  messages: Message[];
  lastMessageAt?: string;
  unreadCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Board User for Mentions
export interface BoardUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

// API Response Types
export interface SendMessageResponse {
  success: boolean;
  message: Message; // Changed from string to Message to match actual response
}

export interface GetMessagesResponse {
  success: boolean;
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchMessagesResponse {
  success: boolean;
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetBoardUsersResponse {
  success: boolean;
  users: BoardUser[];
}

export interface EditMessageResponse {
  success: boolean;
  message: string;
  data: Message;
}

export interface DeleteMessageResponse {
  success: boolean;
  message: string;
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
}

// Socket Event Types
export interface SocketMessage {
  id: string;
  text: string;
  senderId: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  threadId: string;
  messageType: string;
  replyToId?: string;
  mentionedUsers: string[];
  createdAt: string;
}

export interface TypingEvent {
  boardId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface UserJoinedEvent {
  socketId: string;
  boardId: string;
}

export interface UserLeftEvent {
  socketId: string;
  boardId: string;
}

export interface MessageEditedEvent {
  boardId: string;
  messageId: string;
  text: string;
  editedAt: string;
}

export interface MessageDeletedEvent {
  boardId: string;
  messageId: string;
  deletedAt: string;
}

export interface UserPresenceEvent {
  userId: string;
  status: "online" | "away" | "offline";
  socketId: string;
}
