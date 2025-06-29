import type { Message } from "../types";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Chat UI State Store (Client-side state only - NOT for server data)
// All server data is handled by TanStack Query directly
interface ChatState {
  // UI States
  isChatOpen: boolean;
  isSearchOpen: boolean;
  searchQuery: string;

  // Message editing state (UI only)
  editingMessageId: string | null;
  editingText: string;

  // Reply state (UI only)
  replyToMessage: Message | null;

  // Mentions state (UI only)
  showMentionsDropdown: boolean;
  mentionQuery: string;
  mentionPosition: { top: number; left: number } | null;

  // Typing indicators (real-time UI state)
  typingUsers: Array<{ userId: string; userName: string }>;

  // Presence state (real-time UI state)
  onlineUsers: string[];

  // Actions
  toggleChat: () => void;
  closeChat: () => void;
  openChat: () => void;

  // Search actions
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
  closeSearch: () => void;

  // Edit message actions
  startEditingMessage: (messageId: string, currentText: string) => void;
  setEditingText: (text: string) => void;
  cancelEditing: () => void;

  // Reply actions
  setReplyToMessage: (message: Message | null) => void;

  // Mentions actions
  showMentions: (
    position: { top: number; left: number },
    query: string,
  ) => void;
  hideMentions: () => void;
  setMentionQuery: (query: string) => void;

  // Typing actions (for real-time updates)
  addTypingUser: (userId: string, userName: string) => void;
  removeTypingUser: (userId: string) => void;
  clearTypingUsers: () => void;

  // Presence actions (for real-time updates)
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  setOnlineUsers: (userIds: string[]) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      // Initial state
      isChatOpen: false,
      isSearchOpen: false,
      searchQuery: "",

      editingMessageId: null,
      editingText: "",

      replyToMessage: null,

      showMentionsDropdown: false,
      mentionQuery: "",
      mentionPosition: null,

      typingUsers: [],
      onlineUsers: [],

      // Chat toggle actions
      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
      closeChat: () => set({ isChatOpen: false }),
      openChat: () => set({ isChatOpen: true }),

      // Search actions
      toggleSearch: () =>
        set((state) => ({ isSearchOpen: !state.isSearchOpen })),
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      closeSearch: () => set({ isSearchOpen: false, searchQuery: "" }),

      // Edit message actions
      startEditingMessage: (messageId: string, currentText: string) =>
        set({
          editingMessageId: messageId,
          editingText: currentText,
        }),

      setEditingText: (text: string) => set({ editingText: text }),

      cancelEditing: () =>
        set({
          editingMessageId: null,
          editingText: "",
        }),

      // Reply actions
      setReplyToMessage: (message: Message | null) =>
        set({ replyToMessage: message }),

      // Mentions actions
      showMentions: (position: { top: number; left: number }, query: string) =>
        set({
          showMentionsDropdown: true,
          mentionPosition: position,
          mentionQuery: query,
        }),

      hideMentions: () =>
        set({
          showMentionsDropdown: false,
          mentionPosition: null,
          mentionQuery: "",
        }),

      setMentionQuery: (query: string) => set({ mentionQuery: query }),

      // Typing actions (for real-time socket updates)
      addTypingUser: (userId: string, userName: string) =>
        set((state) => {
          const exists = state.typingUsers.some(
            (user) => user.userId === userId,
          );

          if (exists) return state;

          return {
            typingUsers: [...state.typingUsers, { userId, userName }],
          };
        }),

      removeTypingUser: (userId: string) =>
        set((state) => ({
          typingUsers: state.typingUsers.filter(
            (user) => user.userId !== userId,
          ),
        })),

      clearTypingUsers: () => set({ typingUsers: [] }),

      // Presence actions (for real-time socket updates)
      addOnlineUser: (userId: string) =>
        set((state) => {
          if (state.onlineUsers.includes(userId)) return state;

          return { onlineUsers: [...state.onlineUsers, userId] };
        }),

      removeOnlineUser: (userId: string) =>
        set((state) => ({
          onlineUsers: state.onlineUsers.filter((id) => id !== userId),
        })),

      setOnlineUsers: (userIds: string[]) => set({ onlineUsers: userIds }),
    }),
    {
      name: "chat-store",
    },
  ),
);
