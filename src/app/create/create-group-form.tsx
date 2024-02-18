"use client";

import { Button } from "@nextui-org/button";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
} from "@nextui-org/react";
import { EyeFilledIcon } from "../icons/EyeFilledIcon";
import { CrossIcon } from "../icons/CrossIcon";
import { useState } from "react";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { EyeSlashFilledIcon } from "../icons/EyeSlashFilledIcon";
import { createGroup } from "../lib/groups";

type CreateGroupFormInputs = {
  name: string;
  password: string;
  users: { name: string }[];
};

export default function CreateGroupForm() {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateGroupFormInputs>({
    mode: "all",
    defaultValues: {
      users: [{ name: "" }, { name: "" }],
    },
  });

  const onSubmit: SubmitHandler<CreateGroupFormInputs> = async (data) => {
    const users = data.users.map((u) => u.name);
    try {
      await createGroup(data.name, data.password, users);
    } catch (e) {
      reset();
      throw e;
    }
  };

  const { fields, append, remove } = useFieldArray<CreateGroupFormInputs>({
    name: "users",
    control,
  });

  return (
    <form className="grid gap-2" onSubmit={handleSubmit(onSubmit)}>
      <Card shadow="none" className="bg-transparent" fullWidth>
        <CardHeader>
          <h2 className="text-lg">Basic Information</h2>
        </CardHeader>
        <CardBody className="gap-2">
          <Controller
            name="name"
            control={control}
            rules={{ required: "group name is required" }}
            render={({ field, fieldState }) => (
              <Input
                label="Group Name"
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{ required: "password is required" }}
            render={({ field, fieldState }) => (
              <Input
                label="Password"
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                type={isVisible ? "text" : "password"}
                endContent={
                  <Button isIconOnly variant="light" onClick={toggleVisibility}>
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
        </CardBody>

        <CardHeader>
          <h2 className="text-lg">Users</h2>
        </CardHeader>

        <CardBody className="gap-2">
          {fields.map((field, index) => (
            <Controller
              key={field.id}
              name={`users.${index}.name`}
              control={control}
              rules={{ required: "user cannot be empty" }}
              render={({ field, fieldState }) => (
                <div>
                  <Input
                    label={`User ${index + 1}`}
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    endContent={
                      fields.length > 2 && (
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
          <Button onClick={() => append({ name: "" })}>
            Add Additional User
          </Button>
        </CardBody>

        <CardFooter>
          <Button
            type="submit"
            isDisabled={isSubmitting}
            color="primary"
            className="w-full"
            isLoading={isSubmitting}
          >
            Create Group
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
