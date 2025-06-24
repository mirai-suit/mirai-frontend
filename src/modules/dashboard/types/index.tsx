import type { User } from "@/modules/auth/types";

export type UserData = User | null;

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

// API Response Types
export interface GetOrganizationsResponse {
  success: boolean;
  organizations: Organization[];
}

export interface CreateOrganizationResponse {
  success: boolean;
  organization: Organization;
  message: string;
}
