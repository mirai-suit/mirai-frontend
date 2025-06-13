import { useState } from "react";
import { addToast, Button, Input, Link } from "@heroui/react";
import Avatar from "boring-avatars";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { handleApiError } from "@/libs/helpers";
import { registerSchema } from "../validations";
import { useSignup } from "../api";
import { useAuthStore } from "../store";
import { Logo } from "@/components/icons";

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
        useAuthStore
          .getState()
          .setAuth(
            response.data.user,
            response.data.accessToken,
            response.data.refreshToken
          );

        addToast({
          title: "Account created successfully",
          color: "success",
        });

        navigate("/u/" + response.data.user.id);
      },
      onError: (error) => {
        console.error("Register Error:", error);
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
            size={40}
            name={`${watch("firstName")} ${watch("lastName")}`}
            variant="beam"
            colors={["#7828c8", "#006FEE"]}
          />
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 pb-4"
        >
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <Input
                label="First Name"
                type="text"
                size="sm"
                {...field}
                isInvalid={Boolean(errors.firstName)}
                errorMessage={errors.firstName?.message}
              />
            )}
          />
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input
                label="Last Name"
                type="text"
                size="sm"
                {...field}
                isInvalid={Boolean(errors.lastName)}
                errorMessage={errors.lastName?.message}
              />
            )}
          />

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
          <Button color="primary" type="submit" isLoading={isPending}>
            Sign Up
          </Button>
        </form>
        <p className="text-center text-small">
          <Link href="/auth/login" size="sm">
            Already have an account? Login
          </Link>
        </p>
      </div>
    </div>
  );
}
