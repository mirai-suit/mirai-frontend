import apiClient from "@/libs/axios/interceptor";

export const boardAccessService = {
  getBoardAccessList: async (organizationId: string, boardId: string) => {
    const response = await apiClient.get(
      `/board/${boardId}/organization/${organizationId}/access`
    );
    return response.data;
  },
  revokeBoardAccess: async (
    organizationId: string,
    boardId: string,
    userId: string
  ) => {
    const response = await apiClient.delete(
      `/board/${boardId}/organization/${organizationId}/access/${userId}`
    );
    return response.data;
  },
};
