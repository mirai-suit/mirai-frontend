import { useState } from "react";
import { addToast, Button, Input, Link } from "@heroui/react";
import Avatar from "boring-avatars";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { registerSchema } from "../validations";
import { useSignup } from "../api";
import { useAuthStore } from "../store";

import { handleApiError } from "@/libs/helpers";
import { Logo } from "@/components/icons";
import { siteConfig } from "@/config/site";

export default function RegisterForm() {
  const navigate = useNavigate();
  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      roles: ["USER"],
    },
  });

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const { mutateAsync: signup, isPending } = useSignup();
  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    signup(values, {
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
          title: response.message || "Signup successful",
          color: "success",
        });

        // Use setTimeout to ensure state is persisted before navigation
        setTimeout(() => {
          navigate("/u/" + response.data.user.id, { replace: true });
        }, 50);
      },
      onError: (error) => {
        addToast({
          title: "Signup failed",
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
        <p className="text-center text-3xl font-semibold">Welcome!</p>
        <p className="pb-2  text-default-400 text-center text-medium font-medium">
          Create your account
        </p>
        <div className="flex items-center justify-center mb-2">
          <Avatar
            colors={siteConfig?.avatarColors?.beam}
            name={`${watch("firstName")} ${watch("lastName")}`}
            size={siteConfig?.avatarSize}
            variant="beam"
          />
        </div>
        <form
          className="flex flex-col gap-4 pb-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Controller
            control={control}
            name="firstName"
            render={({ field }) => (
              <Input
                label="First Name"
                size="sm"
                type="text"
                {...field}
                errorMessage={errors.firstName?.message}
                isInvalid={Boolean(errors.firstName)}
              />
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field }) => (
              <Input
                label="Last Name"
                size="sm"
                type="text"
                {...field}
                errorMessage={errors.lastName?.message}
                isInvalid={Boolean(errors.lastName)}
              />
            )}
          />

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
          <Button color="primary" isLoading={isPending} type="submit">
            Sign Up
          </Button>
        </form>
        <p className="text-center text-small">
          Already have an account?{" "}
          <Link href="/auth/login" size="sm">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
