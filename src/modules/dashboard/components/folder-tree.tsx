import React from "react";
import {
  Button,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  CaretRight,
  Folder,
  SquaresFour,
  DotsThree,
  PencilSimple,
  Copy,
  Trash,
  FolderPlus,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder as FolderType } from "../types/sidebar.type";

interface FolderTreeProps {
  folders: FolderType[];
  expandedFolders: Record<string, boolean>;
  activeItem: string | null;
  isCollapsed: boolean;
  onFolderToggle: (folderId: string) => void;
  onBoardSelect: (boardId: string) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  expandedFolders,
  activeItem,
  isCollapsed,
  onFolderToggle,
  onBoardSelect,
}) => {
  const handleContextMenu = (
    e: React.MouseEvent,
    itemId: string,
    itemType: "folder" | "board"
  ) => {
    e.preventDefault();
    console.log(`Context menu for ${itemType} ${itemId}`);
  };

  return (
    <div className="space-y-1">
      {folders.map((folder) => (
        <div key={folder.id} className="select-none">
          {/* Folder Header */}
          <div className="relative">
            <Dropdown>
              <div
                className={`flex items-center px-2 py-2 rounded-md cursor-pointer hover:bg-default-100
                          ${expandedFolders[folder.id] ? "bg-default-100" : ""}`}
                onClick={() => onFolderToggle(folder.id)}
                onContextMenu={(e) => handleContextMenu(e, folder.id, "folder")}
              >
                <div className="flex items-center flex-1 min-w-0">
                  <CaretRight
                    size={16}
                    className={`text-default-500 mr-1 transition-transform duration-200 ${
                      expandedFolders[folder.id] ? "rotate-90" : ""
                    } ${isCollapsed ? "mx-auto" : ""}`}
                  />

                  {!isCollapsed && (
                    <>
                      <Folder
                        size={16}
                        weight="fill"
                        className="text-warning mr-2"
                      />
                      <span className="truncate text-sm font-medium">
                        {folder.name}
                      </span>
                    </>
                  )}
                </div>

                {!isCollapsed && (
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="opacity-0 group-hover:opacity-100 hover:bg-default-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DotsThree size={16} />
                    </Button>
                  </DropdownTrigger>
                )}
              </div>

              <DropdownMenu aria-label="Folder Actions">
                <DropdownItem
                  startContent={<PencilSimple size={16} />}
                  key={"rename-folder"}
                >
                  Rename
                </DropdownItem>
                <DropdownItem
                  startContent={<FolderPlus size={16} />}
                  key={"add-board"}
                >
                  Add Board
                </DropdownItem>
                <DropdownItem
                  startContent={<Trash size={16} />}
                  className="text-danger"
                  color="danger"
                  key={"delete-folder"}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* Boards */}
          <AnimatePresence>
            {expandedFolders[folder.id] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="ml-6 space-y-1 mt-1 border-l border-divider pl-2">
                  {folder.boards.map((board) => (
                    <div key={board.id} className="relative group">
                      {isCollapsed ? (
                        <Tooltip content={board.name} placement="right">
                          <Button
                            isIconOnly
                            size="sm"
                            variant={activeItem === board.id ? "flat" : "light"}
                            color={
                              activeItem === board.id ? "primary" : "default"
                            }
                            className="mx-auto mb-1"
                            onPress={() => onBoardSelect(board.id)}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: board.color || "#6366f1",
                              }}
                            />
                          </Button>
                        </Tooltip>
                      ) : (
                        <Dropdown>
                          <div
                            className={`flex items-center px-2 py-2 rounded-md cursor-pointer
                                      ${activeItem === board.id ? "bg-primary-100 text-primary-600" : "hover:bg-default-100"}`}
                            onClick={() => onBoardSelect(board.id)}
                            onContextMenu={(e) =>
                              handleContextMenu(e, board.id, "board")
                            }
                          >
                            <SquaresFour
                              size={16}
                              weight="fill"
                              className="mr-2 flex-shrink-0"
                              style={{ color: board.color || "#6366f1" }}
                            />
                            <span className="truncate text-sm flex-1">
                              {board.name}
                            </span>

                            {board.taskCount !== undefined && (
                              <span className="text-xs text-default-500 ml-2">
                                {board.taskCount}
                              </span>
                            )}

                            <DropdownTrigger>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="opacity-0 group-hover:opacity-100 hover:bg-default-200 ml-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DotsThree size={16} />
                              </Button>
                            </DropdownTrigger>
                          </div>

                          <DropdownMenu aria-label="Board Actions">
                            <DropdownItem
                              startContent={<PencilSimple size={16} />}
                              key={"rename-board"}
                            >
                              Rename
                            </DropdownItem>
                            <DropdownItem
                              startContent={<Copy size={16} />}
                              key={"duplicate-board"}
                            >
                              Duplicate
                            </DropdownItem>
                            <DropdownItem
                              startContent={<Trash size={16} />}
                              className="text-danger"
                              color="danger"
                              key={"delete-board"}
                            >
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
