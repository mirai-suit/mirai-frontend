// User type matching the backend database schema
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  roles?: string[];
  isverified?: boolean;
  plan?: "FREE" | "PRO";
  password?: string;
  preferencesId?: string | null;
  organizations?: string[] | null;
  teams?: string[] | null;
  boardAccess?: string[] | null;
  tasks?: string[] | null;
  organizationCount?: number; // Add organization count
};

// The inner data object returned by authService
export type AuthData = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

// Full API response structure
export type LoginResponse = {
  success: boolean;
  message: string;
  data: AuthData;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
  data: AuthData;
};
