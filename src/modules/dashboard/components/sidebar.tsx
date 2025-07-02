import React from "react";
import { Button, Tooltip } from "@heroui/react";
import { Gear } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

import { Organization } from "../types";

import { SidebarHeader } from "./sidebar-header";
import { OrganizationSelector } from "./organization-selector";
import { OrganizationSelectorSkeleton } from "./organization-selector-skeleton";

import { BoardList } from "@/modules/board/components/board-list";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onCollapse: () => void;
  organizations: Organization[];
  selectedOrg: string;
  onOrgChange: (orgId: string) => void;
  isLoading?: boolean; // New prop to handle loading state
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onToggle,
  onCollapse,
  organizations,
  selectedOrg,
  onOrgChange,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const selectedOrganization =
    organizations.find((org) => org.id === selectedOrg) || organizations[0];

  const handleSettingsClick = () => {
    if (selectedOrg && userId) {
      navigate(`/u/${userId}/o/${selectedOrg}/settings`);
    }
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
        className={`fixed lg:relative z-50 h-full bg-transparent border-divider flex flex-col
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
          {isLoading ? (
            <OrganizationSelectorSkeleton />
          ) : (
            <OrganizationSelector
              organizations={organizations}
              selectedOrg={selectedOrg}
              onOrgChange={onOrgChange}
            />
          )}
        </div>

        {/* Organization with collapsed state */}
        {isCollapsed && selectedOrganization && (
          <div className="px-3 py-4">
            <Tooltip content={selectedOrganization.name} placement="right">
              <Button
                isIconOnly
                aria-label={selectedOrganization.name}
                className="w-10 h-10 rounded-full mx-auto"
                variant="light"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                  {selectedOrganization.name.charAt(0)}
                </div>
              </Button>
            </Tooltip>
          </div>
        )}

        {/* Boards Section */}
        <div className="flex-1 overflow-y-auto">
          <BoardList isCollapsed={isCollapsed} organizationId={selectedOrg} />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-divider">
          {isCollapsed ? (
            <Tooltip content="Organization Settings" placement="right">
              <Button
                isIconOnly
                aria-label="Organization Settings"
                className="w-10 h-10 mx-auto"
                variant="light"
                onPress={handleSettingsClick}
              >
                <Gear size={18} />
              </Button>
            </Tooltip>
          ) : (
            <Button
              className="w-full justify-start"
              startContent={<Gear size={18} />}
              variant="light"
              onPress={handleSettingsClick}
            >
              Organization Settings
            </Button>
          )}
        </div>
      </motion.aside>
    </>
  );
};
