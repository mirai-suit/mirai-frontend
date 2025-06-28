import type {
  CreateNoteResponse,
  GetNotesResponse,
  GetNoteResponse,
  UpdateNoteResponse,
  DeleteNoteResponse,
  NoteFilters,
} from "../types/note";
import type { CreateNoteInput, UpdateNoteInput } from "../validations/note";

import apiClient from "@/libs/axios/interceptor";

export const noteService = {
  // Create a new note for a board
  async createNote(
    boardId: string,
    noteData: CreateNoteInput
  ): Promise<CreateNoteResponse> {
    const response = await apiClient.post(`/boards/${boardId}/notes`, noteData);

    return response.data;
  },

  // Get all notes for a board
  async getNotesForBoard(
    boardId: string,
    filters?: NoteFilters
  ): Promise<GetNotesResponse> {
    const params = new URLSearchParams();

    if (filters?.category) params.append("category", filters.category);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.pinned !== undefined)
      params.append("pinned", filters.pinned.toString());
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = `/boards/${boardId}/notes${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get(url);

    return response.data;
  },

  // Get notes by category for a board
  async getNotesByCategory(
    boardId: string,
    category: string,
    filters?: Omit<NoteFilters, "category">
  ): Promise<GetNotesResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.pinned !== undefined)
      params.append("pinned", filters.pinned.toString());
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = `/boards/${boardId}/notes/category/${category}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get(url);

    return response.data;
  },

  // Get a single note by ID
  async getNoteById(noteId: string): Promise<GetNoteResponse> {
    const response = await apiClient.get(`/notes/${noteId}`);

    return response.data;
  },

  // Update a note
  async updateNote(
    noteId: string,
    updateData: UpdateNoteInput
  ): Promise<UpdateNoteResponse> {
    const response = await apiClient.put(`/notes/${noteId}`, updateData);

    return response.data;
  },

  // Delete a note
  async deleteNote(noteId: string): Promise<DeleteNoteResponse> {
    const response = await apiClient.delete(`/notes/${noteId}`);

    return response.data;
  },
};
