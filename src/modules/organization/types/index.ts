export interface OrganizationMember {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  role: "ADMIN" | "EDITOR" | "MEMBER";
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationInvitation {
  id: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "MEMBER";
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  expiresAt: string;
  invitedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface InvitationDetails {
  email: string;
  role: "ADMIN" | "EDITOR" | "MEMBER";
  organization: {
    id: string;
    name: string;
  };
  invitedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  expiresAt: string;
}

export interface SendInvitationInput {
  email: string;
  role: "ADMIN" | "EDITOR" | "MEMBER";
}

// API Response Types
export interface GetMembersResponse {
  success: boolean;
  members: OrganizationMember[];
}

export interface GetInvitationsResponse {
  success: boolean;
  invitations: OrganizationInvitation[];
}

export interface SendInvitationResponse {
  success: boolean;
  invitation: {
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: string;
  };
}

export interface GetInvitationDetailsResponse {
  success: boolean;
  invitation: InvitationDetails;
}

export interface AcceptInvitationResponse {
  success: boolean;
  organization: {
    id: string;
    name: string;
  };
  role: string;
}
