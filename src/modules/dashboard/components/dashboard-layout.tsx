import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { useOrganizations } from "../api";

import { MandatoryOrgCreationModal } from "./mandatory-org-creation-modal";
import { Sidebar } from "./sidebar";

import { useAuthStore } from "@/modules/auth/store";
import { CreateBoardModal } from "@/modules/board/components/create-board-modal";
import { useBoardStore } from "@/modules/board/store";
import { useOrgStore } from "@/store/useOrgStore";

export default function DashboardLayout() {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string>("");

  // Get URL parameters
  const { orgId } = useParams();

  // Fetch organizations using TanStack Query
  const { data: organizations = [], isLoading: isLoadingOrgs } =
    useOrganizations();

  const handleToggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleOrgChange = (orgId: string) => {
    // Safety check: don't navigate if orgId is empty or invalid
    if (!orgId || orgId === "" || !user?.id) {
      return;
    }

    // Navigate to the new organization URL instead of just setting state
    navigate(`/u/${user.id}/o/${orgId}`);
  };

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated, user, setUser } = useAuthStore((state) => state);
  const { isCreateBoardModalOpen, closeCreateBoardModal } = useBoardStore();
  const { setCurrentOrgId } = useOrgStore();

  useEffect(() => {
    if (pathname === "/u" && isAuthenticated) {
      navigate("/u/" + user?.id);
    }
  }, [pathname, navigate, isAuthenticated, user?.id]);

  // Sync selectedOrg with URL parameter
  useEffect(() => {
    if (orgId && organizations.some((org) => org.id === orgId)) {
      setSelectedOrg(orgId);
      setCurrentOrgId(orgId); // Sync with global store
    } else if (organizations.length > 0 && !orgId) {
      // If no orgId in URL, navigate to the first organization
      if (user?.id) {
        navigate(`/u/${user.id}/o/${organizations[0].id}`);
      }
    }
  }, [orgId, organizations, user?.id, navigate, setCurrentOrgId]);

  const handleOrgCreated = () => {
    // Update the user's organization count to hide the modal
    if (user) {
      setUser({
        ...user,
        organizationCount: (user.organizationCount || 0) + 1,
      });
    }
  };

  const showMandatoryOrgModal = user && user.organizationCount === 0;

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Mandatory Organization Creation Modal */}
      {showMandatoryOrgModal && (
        <MandatoryOrgCreationModal
          isOpen={true}
          onOrgCreated={handleOrgCreated}
        />
      )}

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={isCreateBoardModalOpen}
        onClose={closeCreateBoardModal}
      />

      {/* Sidebar component with real organization data and loading state */}
      <Sidebar
        isCollapsed={isCollapsed}
        isLoading={isLoadingOrgs}
        isOpen={isMobileOpen}
        organizations={organizations}
        selectedOrg={selectedOrg}
        onCollapse={handleToggleCollapse}
        onOrgChange={handleOrgChange}
        onToggle={handleToggleMobile}
      />

      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
