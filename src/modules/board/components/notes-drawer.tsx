import type { NoteCategory, Note } from "../types/note";

import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  ScrollShadow,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import { MagnifyingGlass, Plus, Notepad } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

import { useNotesForBoard } from "../api/note";

import { NoteCard } from "./note-card";
import { CreateNoteModal } from "./create-note-modal";
import { EditNoteModal } from "./edit-note-modal";
import { NoteEmptyState } from "./note-empty-state";

interface NotesDrawerProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

const NOTE_CATEGORIES: { key: NoteCategory; label: string; color: string }[] = [
  { key: "GENERAL", label: "General", color: "default" },
  { key: "MEETING_NOTES", label: "Meeting Notes", color: "primary" },
  { key: "IDEAS", label: "Ideas", color: "secondary" },
  { key: "DOCUMENTATION", label: "Documentation", color: "success" },
  { key: "REMINDERS", label: "Reminders", color: "warning" },
];

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  boardId,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<
    NoteCategory | "all"
  >("all");
  const [showPinnedOnly, setShowPinnedOnly] = React.useState(false);
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);

  const createNoteModal = useDisclosure();
  const editNoteModal = useDisclosure();

  // Build filters
  const filters = React.useMemo(
    () => ({
      search: searchQuery.trim() || undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      pinned: showPinnedOnly || undefined,
    }),
    [searchQuery, selectedCategory, showPinnedOnly],
  );

  const {
    data: notesResponse,
    isLoading,
    error,
  } = useNotesForBoard(boardId, filters);

  const notes = notesResponse?.data?.notes || [];
  const totalNotes = notesResponse?.data?.pagination?.total || 0;

  // Reset filters when drawer closes
  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedCategory("all");
      setShowPinnedOnly(false);
      setEditingNote(null);
    }
  }, [isOpen]);

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    editNoteModal.onOpen();
  };

  const handleCloseEditModal = () => {
    setEditingNote(null);
    editNoteModal.onClose();
  };

  const getCategoryColor = (category: NoteCategory) => {
    return (
      NOTE_CATEGORIES.find((cat) => cat.key === category)?.color || "default"
    );
  };

  return (
    <>
      <Drawer
        hideCloseButton
        isOpen={isOpen}
        placement="right"
        size="lg"
        onClose={onClose}
      >
        <DrawerContent>
          <DrawerHeader className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Notepad size={20} />
                <h2 className="text-lg font-semibold">Notes</h2>
                {totalNotes > 0 && (
                  <Chip color="primary" size="sm" variant="flat">
                    {totalNotes}
                  </Chip>
                )}
              </div>
              <Button
                color="primary"
                size="sm"
                startContent={<Plus size={16} />}
                onPress={createNoteModal.onOpen}
              >
                Add Note
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-3 mt-4">
              <Input
                placeholder="Search notes..."
                startContent={<MagnifyingGlass size={16} />}
                value={searchQuery}
                variant="flat"
                onValueChange={setSearchQuery}
              />

              <div className="flex items-center gap-2 flex-wrap">
                <Select
                  className="max-w-32"
                  placeholder="Category"
                  selectedKeys={[selectedCategory]}
                  size="sm"
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as NoteCategory | "all";

                    setSelectedCategory(value);
                  }}
                >
                  <SelectItem key="all">All Categories</SelectItem>
                  <>
                    {NOTE_CATEGORIES.map((category) => (
                      <SelectItem key={category.key}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </>
                </Select>

                <Button
                  color={showPinnedOnly ? "primary" : "default"}
                  size="sm"
                  variant={showPinnedOnly ? "solid" : "bordered"}
                  onPress={() => setShowPinnedOnly(!showPinnedOnly)}
                >
                  📌 Pinned Only
                </Button>
              </div>
            </div>
          </DrawerHeader>

          <DrawerBody className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Spinner size="md" />
              </div>
            ) : error ? (
              <div className="text-center text-danger">
                Failed to load notes
              </div>
            ) : notes.length === 0 ? (
              <NoteEmptyState
                hasFilters={
                  !!searchQuery || selectedCategory !== "all" || showPinnedOnly
                }
                onCreateNote={createNoteModal.onOpen}
              />
            ) : (
              <ScrollShadow className="h-full">
                <div className="space-y-3">
                  <AnimatePresence>
                    {notes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        initial={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <NoteCard
                          categoryColor={getCategoryColor(note.category)}
                          note={note}
                          onEdit={handleEditNote}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollShadow>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Create Note Modal */}
      <CreateNoteModal
        boardId={boardId}
        isOpen={createNoteModal.isOpen}
        onClose={createNoteModal.onClose}
      />

      {/* Edit Note Modal */}
      {editingNote && (
        <EditNoteModal
          isOpen={editNoteModal.isOpen}
          note={editingNote}
          onClose={handleCloseEditModal}
        />
      )}
    </>
  );
};
