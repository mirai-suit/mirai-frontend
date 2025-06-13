import { useMutation, useQueryClient } from "@tanstack/react-query";

import { LoginResponse, RegisterResponse } from "../types";
import { LoginInput, UserInput } from "../validations";
import { authService } from "../services";

export const useSignup = () => {
  return useMutation<RegisterResponse, Error, UserInput>({
    mutationFn: authService.signup,
  });
};

// Custom hook for login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: (credentials: LoginInput) => authService.login(credentials),
    onSuccess: () => {
      // Invalidate any auth-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
