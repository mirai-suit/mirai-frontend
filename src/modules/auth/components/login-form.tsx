import { addToast, Button, Input, Link } from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { loginSchema } from "../validations";
import { useLogin } from "../api";
import { useAuthStore } from "../store";

import { Logo } from "@/components/icons";
import { handleApiError } from "@/libs/helpers";
export default function LoginForm() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/u/" + userId, { replace: true });
    }
  }, [isAuthenticated, navigate, userId]);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const login = useLogin();
  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    login.mutateAsync(values, {
      onSuccess: (response) => {
        // Set auth state
        useAuthStore
          .getState()
          .setAuth(
            response.data.user,
            response.data.accessToken,
            response.data.refreshToken,
          );

        addToast({
          title: response.message || "Login successful",
          color: "success",
        });

        // Use setTimeout to ensure state is persisted before navigation
        setTimeout(() => {
          navigate("/u/" + response.data.user.id, { replace: true });
        }, 50);
      },
      onError: (error) => {
        addToast({
          title: "Something went wrong",
          color: "danger",
          description: handleApiError(error).message,
        });
      },
    });
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col rounded-large px-8 pb-10 pt-6">
        <div className="flex w-full items-center justify-center">
          <Logo size={40} />
        </div>
        <p className=" text-center text-3xl font-semibold">Welcome!</p>
        <p className="pb-2 text-default-400 text-center text-medium font-medium">
          Login to your account
        </p>

        <form
          className="flex flex-col gap-4 pb-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                label="Email"
                size="sm"
                type="text"
                {...field}
                errorMessage={errors.email?.message}
                isInvalid={Boolean(errors.email)}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <Eye className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeSlash className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                label="Password"
                size="sm"
                type={isVisible ? "text" : "password"}
                {...field}
                errorMessage={errors.password?.message}
                isInvalid={Boolean(errors.password)}
              />
            )}
          />
          <Button color="primary" isLoading={login.isPending} type="submit">
            {login.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <p className="text-center text-small">
          <Link href="/auth/register" size="sm">
            Don&apos;t have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
