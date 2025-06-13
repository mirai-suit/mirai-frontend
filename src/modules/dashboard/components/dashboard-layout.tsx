import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/modules/auth/store";
import { List } from "@phosphor-icons/react";
import { mockOrganizations } from "./mock-data";
import { Sidebar } from "./sidebar";

export default function DashboardLayout() {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [selectedOrg, setSelectedOrg] = React.useState(mockOrganizations[0].id);

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
  const { isAuthenticated, user } = useAuthStore((state) => state);

  useEffect(() => {
    if (pathname === "/u" && isAuthenticated) {
      navigate("/u/" + user?.id);
    }
  }, [pathname, navigate]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar component */}
      <Sidebar
        isOpen={isMobileOpen}
        isCollapsed={isCollapsed}
        onToggle={handleToggleMobile}
        onCollapse={handleToggleCollapse}
        organizations={mockOrganizations}
        selectedOrg={selectedOrg}
        onOrgChange={handleOrgChange}
      />

      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
