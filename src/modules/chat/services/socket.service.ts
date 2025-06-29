import type {
  SocketMessage,
  TypingEvent,
  UserJoinedEvent,
  UserLeftEvent,
  MessageEditedEvent,
  MessageDeletedEvent,
  UserPresenceEvent,
} from "../types";

import io from "socket.io-client";

export class ChatSocketService {
  private socket: any = null;
  private boardId: string | null = null;

  // Initialize socket connection
  init(serverUrl: string): void {
    if (this.socket) return;

    this.socket = io(serverUrl, {
      autoConnect: false,
      transports: ["websocket"],
    });

    this.setupEventListeners();
  }

  // Connect to socket server
  connect(): void {
    if (this.socket && !this.socket.connected) {
      // eslint-disable-next-line no-console
      console.log("🔌 Attempting to connect to socket server...");
      this.socket.connect();
    }
  }

  // Disconnect from socket server
  disconnect(): void {
    if (this.socket) {
      this.leaveBoard();
      this.socket.disconnect();
    }
  }

  // Destroy socket connection
  destroy(): void {
    if (this.socket) {
      this.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
      this.boardId = null;
    }
  }

  // Join a board room
  joinBoard(boardId: string): void {
    if (!this.socket || !this.socket.connected) {
      // eslint-disable-next-line no-console
      console.warn("⚠️ Cannot join board - socket not connected");

      return;
    }

    // Leave current board if any
    if (this.boardId && this.boardId !== boardId) {
      this.leaveBoard();
    }

    // eslint-disable-next-line no-console
    console.log("🏠 Joining board room:", boardId);
    this.boardId = boardId;
    this.socket.emit("joinBoard", boardId);
  }

  // Leave current board room
  leaveBoard(): void {
    if (!this.socket || !this.boardId) return;

    this.socket.emit("leaveBoard", this.boardId);
    this.boardId = null;
  }

  // Send typing indicator
  sendTyping(userId: string, userName: string, isTyping: boolean): void {
    if (!this.socket || !this.boardId) return;

    this.socket.emit("typing", {
      boardId: this.boardId,
      userId,
      userName,
      isTyping,
    });
  }

  // Send message (REMOVED - No longer needed for own messages)
  // The API call handles sending and the server broadcasts to other users
  // We use optimistic updates for immediate UI feedback

  // Send message edit broadcast (for real-time updates to other users)
  editMessage(messageId: string, text: string): void {
    if (!this.socket || !this.boardId) return;

    this.socket.emit("editMessage", {
      boardId: this.boardId,
      messageId,
      text,
      editedAt: new Date().toISOString(),
    });
  }

  // Send message delete broadcast
  deleteMessage(messageId: string): void {
    if (!this.socket || !this.boardId) return;

    this.socket.emit("deleteMessage", {
      boardId: this.boardId,
      messageId,
      deletedAt: new Date().toISOString(),
    });
  }

  // Update presence status
  updatePresence(userId: string, status: "online" | "away" | "offline"): void {
    if (!this.socket || !this.boardId) return;

    this.socket.emit("updatePresence", {
      boardId: this.boardId,
      userId,
      status,
    });
  }

  // Event listeners setup
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      // eslint-disable-next-line no-console
      console.log("✅ Connected to chat server");
    });

    this.socket.on("disconnect", () => {
      // eslint-disable-next-line no-console
      console.log("❌ Disconnected from chat server");
    });

    this.socket.on("error", (error: Error) => {
      // eslint-disable-next-line no-console
      console.error("🚨 Socket error:", error);
      throw error;
    });
  }

  // Event listener methods for components to subscribe
  onConnect(callback: () => void): void {
    if (!this.socket) return;
    this.socket.on("connect", callback);
  }

  onReceiveMessage(callback: (message: SocketMessage) => void): void {
    if (!this.socket) return;
    this.socket.on("newMessage", callback);
  }

  onUserJoined(callback: (data: UserJoinedEvent) => void): void {
    if (!this.socket) return;
    this.socket.on("userJoined", callback);
  }

  onUserLeft(callback: (data: UserLeftEvent) => void): void {
    if (!this.socket) return;
    this.socket.on("userLeft", callback);
  }

  onUserTyping(callback: (data: TypingEvent) => void): void {
    if (!this.socket) return;
    this.socket.on("userTyping", callback);
  }

  onMessageEdited(callback: (data: MessageEditedEvent) => void): void {
    if (!this.socket) return;
    this.socket.on("messageEdited", callback);
  }

  onMessageDeleted(callback: (data: MessageDeletedEvent) => void): void {
    if (!this.socket) return;
    this.socket.on("messageDeleted", callback);
  }

  onUserPresenceChanged(callback: (data: UserPresenceEvent) => void): void {
    if (!this.socket) return;
    this.socket.on("userPresenceChanged", callback);
  }

  // Remove event listeners
  offConnect(): void {
    if (!this.socket) return;
    this.socket.off("connect");
  }

  offReceiveMessage(): void {
    if (!this.socket) return;
    this.socket.off("newMessage");
  }

  offUserJoined(): void {
    if (!this.socket) return;
    this.socket.off("userJoined");
  }

  offUserLeft(): void {
    if (!this.socket) return;
    this.socket.off("userLeft");
  }

  offUserTyping(): void {
    if (!this.socket) return;
    this.socket.off("userTyping");
  }

  offMessageEdited(): void {
    if (!this.socket) return;
    this.socket.off("messageEdited");
  }

  offMessageDeleted(): void {
    if (!this.socket) return;
    this.socket.off("messageDeleted");
  }

  offUserPresenceChanged(): void {
    if (!this.socket) return;
    this.socket.off("userPresenceChanged");
  }

  // Get current connection status
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Get current board ID
  get currentBoardId(): string | null {
    return this.boardId;
  }
}

// Create singleton instance
export const chatSocketService = new ChatSocketService();
