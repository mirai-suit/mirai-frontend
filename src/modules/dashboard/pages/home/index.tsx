import { useState } from "react";
import { List } from "@phosphor-icons/react";
import { Button } from "@heroui/react";

export default function DashboardHome() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleToggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      <div className="lg:hidden mb-4">
        <Button
          className="p-2 rounded-md bg-content1 shadow-sm"
          onPress={handleToggleMobile}
        >
          <List className="text-default-500" size={24} />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <div className="p-6 bg-content1 rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">
          Task Management Dashboard
        </h1>
        <p className="text-default-500">
          Select a board from the sidebar to view tasks.
        </p>
      </div>
    </>
  );
}
