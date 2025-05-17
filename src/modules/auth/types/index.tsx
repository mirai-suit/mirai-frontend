export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  isverified: boolean;
  plan: "FREE" | "PRO";
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
};

export type RegisterResponse = {
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
};
