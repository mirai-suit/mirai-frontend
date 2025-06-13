import React from "react";
import { Avatar, Button, Tooltip } from "@heroui/react";
import { FolderPlus, Gear } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

import { Organization } from "../types/sidebar.type";

import { SidebarHeader } from "./sidebar-header";
import { OrganizationSelector } from "./organization-selector";
import { FolderTree } from "./folder-tree";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onCollapse: () => void;
  organizations: Organization[];
  selectedOrg: string;
  onOrgChange: (orgId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onToggle,
  onCollapse,
  organizations,
  selectedOrg,
  onOrgChange,
}) => {
  const [expandedFolders, setExpandedFolders] = React.useState<
    Record<string, boolean>
  >({});
  const [activeItem, setActiveItem] = React.useState<string | null>(null);

  const selectedOrganization =
    organizations.find((org) => org.id === selectedOrg) || organizations[0];

  const handleFolderToggle = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleBoardSelect = (boardId: string) => {
    setActiveItem(boardId);
  };

  const handleCreateFolder = () => {
    console.log("Create new folder");
  };

  // Determine sidebar width based on state
  const sidebarWidth = isCollapsed ? "w-16" : "w-72";

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 0.5 }}
            className="fixed inset-0 bg-overlay z-40 lg:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        aria-label="Application sidebar"
        className={`fixed lg:relative z-50 h-full bg-content1 border-r border-divider flex flex-col
                   transition-all duration-300 ease-in-out ${sidebarWidth}
                   ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        initial={false}
      >
        {/* Header Section */}
        <SidebarHeader
          isCollapsed={isCollapsed}
          onCollapse={onCollapse}
          onToggleMobile={onToggle}
        />

        {/* Organization Selector */}
        <div className={`px-3 py-4 ${isCollapsed ? "hidden" : "block"}`}>
          <OrganizationSelector
            organizations={organizations}
            selectedOrg={selectedOrg}
            onOrgChange={onOrgChange}
          />
        </div>

        {/* Organization with collapsed state */}
        {isCollapsed && (
          <div className="px-3 py-4">
            <Tooltip content={selectedOrganization.name} placement="right">
              <Button
                isIconOnly
                aria-label={selectedOrganization.name}
                className="w-10 h-10 rounded-full mx-auto"
                variant="light"
              >
                {selectedOrganization.avatar ? (
                  <Avatar
                    name={selectedOrganization.name.charAt(0)}
                    size="sm"
                    src={selectedOrganization.avatar}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                    {selectedOrganization.name.charAt(0)}
                  </div>
                )}
              </Button>
            </Tooltip>
          </div>
        )}

        {/* Folder Structure */}
        <div className="flex-1 overflow-y-auto px-2">
          <div className="flex items-center justify-between px-2 py-3">
            {!isCollapsed && (
              <h3 className="text-sm font-medium text-foreground-600">
                Folders
              </h3>
            )}
            <Tooltip
              content="Create new folder"
              placement={isCollapsed ? "right" : "top"}
            >
              <Button
                isIconOnly
                aria-label="Create new folder"
                size="sm"
                variant="light"
                onPress={handleCreateFolder}
              >
                <FolderPlus size={18} />
              </Button>
            </Tooltip>
          </div>

          <FolderTree
            activeItem={activeItem}
            expandedFolders={expandedFolders}
            folders={selectedOrganization.folders}
            isCollapsed={isCollapsed}
            onBoardSelect={handleBoardSelect}
            onFolderToggle={handleFolderToggle}
          />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-divider">
          {isCollapsed ? (
            <Tooltip content="Settings" placement="right">
              <Button
                isIconOnly
                aria-label="Settings"
                className="w-10 h-10 mx-auto"
                variant="light"
              >
                <Gear size={18} />
              </Button>
            </Tooltip>
          ) : (
            <Button
              className="w-full justify-start"
              startContent={<Gear size={18} />}
              variant="light"
            >
              Settings
            </Button>
          )}
        </div>
      </motion.aside>
    </>
  );
};
