"use client";

import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader, Input } from "@nextui-org/react";
import { useState } from "react";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { useTheme } from "next-themes";
import { successToast } from "@/app/lib/toast";
import { groups, users } from "@prisma/client";
import { useRouter } from "next/navigation";
import { CrossIcon } from "@/app/icons/CrossIcon";
import { updateGroupUsers } from "@/app/lib/groups";

type GroupUsersFormInputs = {
  users: { id: string; name: string }[];
};

export default function UsersSection({
  group,
}: {
  group: Omit<groups & { users: Omit<users, "groupid">[] }, "password">;
}) {
  const { theme } = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);

  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<GroupUsersFormInputs>({
    mode: "all",
    defaultValues: {
      users: group.users.map((user) => ({ id: user.id, name: user.name })),
    },
  });

  const { fields, append, remove } = useFieldArray<GroupUsersFormInputs>({
    name: "users",
    control,
  });

  const onSubmit: SubmitHandler<GroupUsersFormInputs> = async (data) => {
    const usersToUpdate = data.users.filter(
      (user, idx) =>
        idx >= group.users.length || user.name !== group.users[idx].name
    );

    if (!usersToUpdate.length) {
      setIsEditMode(false);
      return;
    }

    await updateGroupUsers(group.id, usersToUpdate);

    successToast(
      "Users updated successfully!",
      theme === "dark" ? "dark" : "light"
    );
    setIsEditMode(false);

    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <h3>Users</h3>
      </CardHeader>

      <CardBody>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          {fields.map((field, index) => (
            <Controller
              key={field.id}
              name={`users.${index}.name`}
              control={control}
              rules={{ required: "User cannot be empty" }}
              render={({ field, fieldState }) => (
                <div>
                  <Input
                    label={`User ${index + 1}`}
                    isDisabled={!isEditMode}
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    endContent={
                      index >= group.users.length &&
                      isEditMode && (
                        <Button
                          isIconOnly
                          variant="light"
                          onClick={() => remove(index)}
                        >
                          <CrossIcon />
                        </Button>
                      )
                    }
                    {...field}
                  />
                </div>
              )}
            />
          ))}

          {isEditMode ? (
            <>
              <Button onClick={() => append({ id: "", name: "" })}>
                Add Additional User
              </Button>
              <Button type="submit" color="primary" isLoading={isSubmitting}>
                Save Users
              </Button>
            </>
          ) : (
            <Button
              type="button"
              color="primary"
              onClick={(e) => {
                e.preventDefault();
                setIsEditMode(true);
              }}
            >
              Edit Users
            </Button>
          )}
        </form>
      </CardBody>
    </Card>
  );
}
