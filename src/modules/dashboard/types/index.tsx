import type { User } from "@/modules/auth/types";

import React from "react";

export type UserData = User | null;

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface CreateOrganizationResponse {
  organization: Organization;
  message: string;
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}

export interface WorkspaceItem {
  id: string;
  workspaceId: string;
  parentId: string | null;
  type: "folder" | "list";
  name: string;
}
