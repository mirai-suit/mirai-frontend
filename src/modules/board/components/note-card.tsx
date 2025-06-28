import type { Note } from "../types/note";

import React from "react";
import { Card, CardBody, CardHeader, Button, Chip } from "@heroui/react";
import { PencilSimple, Trash, PushPin } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Avatar from "boring-avatars";

import { useUpdateNote, useDeleteNote } from "../api/note";
import { useAuthStore } from "../../auth/store";

import { siteConfig } from "@/config/site";

interface NoteCardProps {
  note: Note;
  categoryColor?: string;
  onEdit?: (note: Note) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  categoryColor = "default",
  onEdit,
}) => {
  const { user } = useAuthStore();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const isAuthor = user?.id === note.authorId;

  const handleTogglePin = () => {
    updateNoteMutation.mutate({
      noteId: note.id,
      updateData: { isPinned: !note.isPinned },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(note.id);
    }
  };

  const formatCategoryLabel = (category: string) => {
    return category
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <motion.div
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 0.99 }}
    >
      <Card isBlurred className="w-full relative" shadow="none">
        {note.isPinned && (
          <div className="absolute top-2 right-2 z-10">
            <PushPin className="text-warning" size={16} />
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between w-full">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Avatar
                    colors={siteConfig.avatarColors.beam}
                    name={`${note.author.firstName} ${note.author.lastName}`}
                    size={20}
                    variant="beam"
                  />

                  <span className="text-sm text-default-400">
                    {note.author.firstName} {note.author.lastName}
                  </span>
                </div>
                <Chip color={categoryColor as any} size="sm" variant="flat">
                  {formatCategoryLabel(note.category)}
                </Chip>
              </div>
              <h4 className="text-sm font-semibold  mt-2 text-foreground line-clamp-2">
                {note.title}
              </h4>
            </div>
          </div>
        </CardHeader>

        <CardBody className="pt-0">
          <p className="text-sm text-default-600 line-clamp-3 mb-3">
            {note.content}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-default-400">
              {new Date(note.createdAt).toLocaleDateString()}
            </span>

            {isAuthor && (
              <div className="flex items-center gap-1">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={handleTogglePin}
                >
                  <PushPin
                    className={
                      note.isPinned ? "text-warning" : "text-default-400"
                    }
                    size={14}
                  />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => onEdit?.(note)}
                >
                  <PencilSimple size={14} />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={handleDelete}
                >
                  <Trash className="text-danger" size={14} />
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
