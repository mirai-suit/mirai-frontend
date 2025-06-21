import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useOrganizations } from "../api";

import { MandatoryOrgCreationModal } from "./mandatory-org-creation-modal";
import { Sidebar } from "./sidebar";

import { useAuthStore } from "@/modules/auth/store";

export default function DashboardLayout() {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string>("");

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
    setSelectedOrg(orgId);
  };

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated, user, setUser } = useAuthStore((state) => state);

  useEffect(() => {
    if (pathname === "/u" && isAuthenticated) {
      navigate("/u/" + user?.id);
    }
  }, [pathname, navigate, isAuthenticated, user?.id]);

  // Set first organization as selected when organizations load
  useEffect(() => {
    if (organizations.length > 0 && !selectedOrg) {
      setSelectedOrg(organizations[0].id);
    }
  }, [organizations, selectedOrg]);

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

  // Show loading state while fetching organizations
  if (isLoadingOrgs) {
    return (
      <div className="flex h-screen bg-background text-foreground items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-default-500">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Mandatory Organization Creation Modal */}
      {showMandatoryOrgModal && (
        <MandatoryOrgCreationModal
          isOpen={true}
          onOrgCreated={handleOrgCreated}
        />
      )}

      {/* Sidebar component with real organization data */}
      <Sidebar
        isCollapsed={isCollapsed}
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
