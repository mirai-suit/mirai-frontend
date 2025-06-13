import { useState } from "react";
import { addToast, Button, Input, Link } from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { Logo } from "@/components/icons";
import { loginSchema } from "../validations";
import { useLogin } from "../api";
import { useAuthStore } from "../store";
import { handleApiError } from "@/libs/helpers";

export default function LoginForm() {
  const navigate = useNavigate();
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
        useAuthStore
          .getState()
          .setAuth(
            response.data.user,
            response.data.accessToken,
            response.data.refreshToken
          );

        addToast({
          title: "Logged in successfully",
          color: "success",
        });
        navigate("/u/" + response.data.user.id);
      },
      onError: (error) => {
        console.log("ERROR", error);
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
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 pb-4"
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                label="Email"
                type="text"
                size="sm"
                {...field}
                isInvalid={Boolean(errors.email)}
                errorMessage={errors.email?.message}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                label="Password"
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
                type={isVisible ? "text" : "password"}
                size="sm"
                {...field}
                isInvalid={Boolean(errors.password)}
                errorMessage={errors.password?.message}
              />
            )}
          />
          <Button color="primary" type="submit" isLoading={login.isPending}>
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
