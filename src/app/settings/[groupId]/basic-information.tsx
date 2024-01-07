"use client";

import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader, Input, Spacer } from "@nextui-org/react";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { updateGroupName, updateGroupPassword } from "../../lib/groups";
import { useTheme } from "next-themes";
import { successToast } from "@/app/lib/toast";
import { groups } from "@prisma/client";
import { useRouter } from "next/navigation";
import { EyeFilledIcon } from "@/app/icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "@/app/icons/EyeSlashFilledIcon";

type GroupNameFormInputs = {
  name: string;
};

type GroupPasswordFormInputs = {
  password: string;
};

export default function BasicInformationSection({
  group,
}: {
  group: Omit<groups, "password">;
}) {
  const { theme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <h3>Basic Information</h3>
      </CardHeader>

      <CardBody>
        <GroupNameForm
          group={group}
          theme={theme === "dark" ? "dark" : "light"}
        />

        <Spacer y={4} />

        <GroupPasswordForm
          group={group}
          theme={theme === "dark" ? "dark" : "light"}
        />
      </CardBody>
    </Card>
  );
}

function GroupNameForm({
  group,
  theme,
}: {
  group: Omit<groups, "password">;
  theme: "light" | "dark";
}) {
  const [isEditMode, setIsEditMode] = useState(false);

  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<GroupNameFormInputs>({
    mode: "all",
    defaultValues: {
      name: group.name,
    },
  });

  const onSubmit: SubmitHandler<GroupNameFormInputs> = async (data) => {
    await updateGroupName(group.id, data.name);

    successToast("Group name updated successfully!", theme);
    setIsEditMode(false);

    router.refresh();
  };

  return (
    <form className="flex gap-2" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        rules={{ required: "group name is required" }}
        render={({ field, fieldState }) => (
          <Input
            label="Group Name"
            isDisabled={!isEditMode}
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            {...field}
          />
        )}
      />

      {isEditMode ? (
        <Button
          type="submit"
          className="h-auto"
          color="primary"
          isLoading={isSubmitting}
        >
          Save
        </Button>
      ) : (
        <Button
          type="button"
          className="h-auto"
          color="primary"
          onClick={(e) => {
            e.preventDefault();
            setIsEditMode(true);
          }}
        >
          Edit
        </Button>
      )}
    </form>
  );
}

function GroupPasswordForm({
  group,
  theme,
}: {
  group: Omit<groups, "password">;
  theme: "light" | "dark";
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<GroupPasswordFormInputs>({
    mode: "all",
    defaultValues: {
      password: "",
    },
  });

  const onSubmit: SubmitHandler<GroupPasswordFormInputs> = async (data) => {
    await updateGroupPassword(group.id, data.password);

    successToast("Group password updated successfully!", theme);
    setIsEditMode(false);

    router.refresh();
  };

  return (
    <form className="flex gap-2" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="password"
        control={control}
        rules={{ required: "password is required" }}
        render={({ field, fieldState }) => (
          <Input
            label="Password"
            isDisabled={!isEditMode}
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            type={isVisible ? "text" : "password"}
            endContent={
              <Button
                isIconOnly
                variant="light"
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? (
                  <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                ) : (
                  <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                )}
              </Button>
            }
            {...field}
          />
        )}
      />

      {isEditMode ? (
        <Button type="submit" className="h-auto" isLoading={isSubmitting}>
          Save
        </Button>
      ) : (
        <Button
          type="button"
          className="h-auto"
          color="primary"
          onClick={(e) => {
            e.preventDefault();
            setIsEditMode(true);
          }}
        >
          Edit
        </Button>
      )}
    </form>
  );
}
