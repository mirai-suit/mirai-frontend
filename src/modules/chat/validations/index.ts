import { z } from "zod";

// Send Message Validation
export const sendMessageSchema = z.object({
  text: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message cannot exceed 1000 characters"),
  replyToId: z.string().uuid().optional(),
  mentionedUsers: z.array(z.string().uuid()).optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// Edit Message Validation
export const editMessageSchema = z.object({
  text: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message cannot exceed 1000 characters"),
});

export type EditMessageInput = z.infer<typeof editMessageSchema>;

// Search Messages Validation
export const searchMessagesSchema = z.object({
  query: z
    .string()
    .min(1, "Search query cannot be empty")
    .max(100, "Search query cannot exceed 100 characters"),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(50).optional().default(20),
});

export type SearchMessagesInput = z.infer<typeof searchMessagesSchema>;

// Get Messages Validation
export const getMessagesSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(50).optional().default(20),
});

export type GetMessagesInput = z.infer<typeof getMessagesSchema>;

// Typing Event Validation
export const typingEventSchema = z.object({
  boardId: z.string().uuid(),
  userId: z.string().uuid(),
  userName: z.string(),
  isTyping: z.boolean(),
});

export type TypingEventInput = z.infer<typeof typingEventSchema>;
