import type {
  Organization,
  GetOrganizationsResponse,
  CreateOrganizationResponse,
} from "../types";

import { CreateOrganizationInput } from "../validations";

import apiClient from "@/libs/axios/interceptor";

export const organizationService = {
  // Create organization method
  async createOrganization(
    organizationData: CreateOrganizationInput,
  ): Promise<Organization> {
    const response = await apiClient.post<CreateOrganizationResponse>(
      "/organization/create",
      organizationData,
    );

    return response.data.organization;
  },

  // Get user's organizations
  async getOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get<GetOrganizationsResponse>(
      "/organization/my-organizations",
    );

    return response.data.organizations;
  },

  // Update organization (for future use)
  async updateOrganization(id: string, data: Partial<CreateOrganizationInput>) {
    const response = await apiClient.put(`/organization/${id}`, data);

    return response.data;
  },

  // Delete organization (for future use)
  async deleteOrganization(id: string) {
    const response = await apiClient.delete(`/organization/${id}`);

    return response.data;
  },
};
