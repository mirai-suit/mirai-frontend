import type { User } from "@/modules/auth/types";
import type { Organization } from "@/types/organization";

export type UserData = User | null;

// Re-export the global Organization type to maintain compatibility
export type { Organization };

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
