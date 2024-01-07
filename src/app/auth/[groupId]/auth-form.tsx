"use client";

import { Button } from "@nextui-org/button";
import { Input, Spacer } from "@nextui-org/react";
import { EyeFilledIcon } from "../../icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../../icons/EyeSlashFilledIcon";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { authenticateUserForGroup } from "@/app/lib/auth";

export type AuthFormInputs = {
  password: string;
};

export default function AuthForm({ groupId }: { groupId: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const {
    handleSubmit,
    control,
    setError,
    formState: { isSubmitting },
  } = useForm<AuthFormInputs>({
    mode: "all",
    defaultValues: {
      password: "",
    },
  });

  const onSubmit: SubmitHandler<AuthFormInputs> = async (data) => {
    const error = await authenticateUserForGroup(groupId, data.password);

    if (error) {
      setError("password", { type: "custom", message: error });
    }
  };

  return (
    <div>
      <h2>Access to this group requires a password.</h2>
      <Spacer y={4} />
      <form className="grid gap-2" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="password"
          control={control}
          rules={{ required: "Password is required" }}
          render={({ field, fieldState }) => (
            <Input
              label="Password"
              variant="bordered"
              type={isVisible ? "text" : "password"}
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              endContent={
                <button type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              {...field}
            />
          )}
        />
        <Spacer y={2} />
        <Button size="lg" type="submit" isLoading={isSubmitting} color="primary">
          Enter Group
        </Button>
      </form>
    </div>
  );
}
