import type {
  GetNotesResponse,
  GetNoteResponse,
  NoteFilters,
} from "../types/note";
import type { CreateNoteInput, UpdateNoteInput } from "../validations/note";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { addToast } from "@heroui/react";

import { noteService } from "../services/note";

// Query Keys
export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  list: (boardId: string, filters?: NoteFilters) =>
    [...noteKeys.lists(), boardId, filters] as const,
  details: () => [...noteKeys.all, "detail"] as const,
  detail: (noteId: string) => [...noteKeys.details(), noteId] as const,
  categories: (boardId: string, category: string) =>
    [...noteKeys.all, "category", boardId, category] as const,
};

// Get all notes for a board
export const useNotesForBoard = (
  boardId: string,
  filters?: NoteFilters,
  options?: UseQueryOptions<GetNotesResponse>
) => {
  return useQuery({
    queryKey: noteKeys.list(boardId, filters),
    queryFn: () => noteService.getNotesForBoard(boardId, filters),
    enabled: !!boardId,
    ...options,
  });
};

// Get notes by category
export const useNotesByCategory = (
  boardId: string,
  category: string,
  filters?: Omit<NoteFilters, "category">,
  options?: UseQueryOptions<GetNotesResponse>
) => {
  return useQuery({
    queryKey: noteKeys.categories(boardId, category),
    queryFn: () => noteService.getNotesByCategory(boardId, category, filters),
    enabled: !!boardId && !!category,
    ...options,
  });
};

// Get single note by ID
export const useNote = (
  noteId: string,
  options?: UseQueryOptions<GetNoteResponse>
) => {
  return useQuery({
    queryKey: noteKeys.detail(noteId),
    queryFn: () => noteService.getNoteById(noteId),
    enabled: !!noteId,
    ...options,
  });
};

// Create note mutation
export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardId,
      noteData,
    }: {
      boardId: string;
      noteData: CreateNoteInput;
    }) => noteService.createNote(boardId, noteData),
    onSuccess: (_data, _variables) => {
      // Invalidate and refetch notes for the board
      queryClient.invalidateQueries({
        queryKey: noteKeys.lists(),
      });

      // Add success toast
      addToast({
        title: "Success",
        description: "Note created successfully",
        color: "success",
      });
    },
    onError: (error: any) => {
      // Add error toast
      addToast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create note",
        color: "danger",
      });
    },
  });
};

// Update note mutation
export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteId,
      updateData,
    }: {
      noteId: string;
      updateData: UpdateNoteInput;
    }) => noteService.updateNote(noteId, updateData),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch notes
      queryClient.invalidateQueries({
        queryKey: noteKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: noteKeys.detail(variables.noteId),
      });

      // Add success toast
      addToast({
        title: "Success",
        description: "Note updated successfully",
        color: "success",
      });
    },
    onError: (error: any) => {
      // Add error toast
      addToast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update note",
        color: "danger",
      });
    },
  });
};

// Delete note mutation
export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => noteService.deleteNote(noteId),
    onSuccess: (_data, noteId) => {
      // Invalidate and refetch notes
      queryClient.invalidateQueries({
        queryKey: noteKeys.lists(),
      });
      queryClient.removeQueries({
        queryKey: noteKeys.detail(noteId),
      });

      // Add success toast
      addToast({
        title: "Success",
        description: "Note deleted successfully",
        color: "success",
      });
    },
    onError: (error: any) => {
      // Add error toast
      addToast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete note",
        color: "danger",
      });
    },
  });
};
