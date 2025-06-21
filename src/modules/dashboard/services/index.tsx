import { CreateOrganizationInput } from "../validations";

import apiClient from "@/libs/axios/interceptor";

export const organizationService = {
  // Create organization method
  async createOrganization(organizationData: CreateOrganizationInput) {
    const response = await apiClient.post(
      "/organization/create",
      organizationData
    );

    // Backend returns { success: true, organization: {...} } or similar
    // Extract just the organization object
    return response.data.organization || response.data;
  },

  // Get user's organizations
  async getOrganizations() {
    const response = await apiClient.get("/organization/my-organizations");

    // Backend returns { success: true, organizations: [...] }
    // Extract just the organizations array
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
