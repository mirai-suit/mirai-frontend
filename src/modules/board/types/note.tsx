// Note Types - matching backend DTOs for type safety

export type NoteCategory =
  | "GENERAL"
  | "MEETING_NOTES"
  | "IDEAS"
  | "DOCUMENTATION"
  | "REMINDERS";

// Note Response DTO
export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  boardId: string;
  authorId: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

// Create Note Response
export interface CreateNoteResponse {
  success: boolean;
  message: string;
  data?: Note;
  error?: any;
}

// Get Notes Response
export interface GetNotesResponse {
  success: boolean;
  message: string;
  data?: {
    notes: Note[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: any;
}

// Get Note Response
export interface GetNoteResponse {
  success: boolean;
  message: string;
  data?: Note;
  error?: any;
}

// Update Note Response
export interface UpdateNoteResponse {
  success: boolean;
  message: string;
  data?: Note;
  error?: any;
}

// Delete Note Response
export interface DeleteNoteResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
  };
  error?: any;
}

// Note Filter Options
export interface NoteFilters {
  category?: NoteCategory;
  search?: string;
  pinned?: boolean;
  page?: number;
  limit?: number;
}
