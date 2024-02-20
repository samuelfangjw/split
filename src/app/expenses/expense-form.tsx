"use client";

import { getCurrencies } from "@/app/lib/currencies";
import { Button } from "@nextui-org/button";
import {
  Autocomplete,
  AutocompleteItem,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Input,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import SharesModal from "./shares-modal";
import { calculateSharesWithAmount } from "@/app/lib/shares";
import { addExpense, editExpense } from "@/app/lib/transactions";
import { expenses, groups, shares, users } from "@prisma/client";
import { useState } from "react";
import { successToast } from "../lib/toast";
import { useTheme } from "next-themes";

export type AddExpenseFormInputs = {
  amount: string;
  description: string;
  currency: string;
  payerId: string;
  note: string;
  shares: {
    payeeId: string;
    name: string;
    share: string;
  }[];
};

export default function ExpenseForm({
  group,
  expense,
}: {
  group: Omit<groups & { users: Omit<users, "groupid">[] }, "password">;
  expense: (expenses & { shares: shares[] }) | null;
}) {
  const isAddMode = !expense;
  const [isViewMode, setIsViewMode] = useState(!!expense);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { theme } = useTheme();

  const currencies = getCurrencies();

  const getMode = () => {
    return isAddMode ? "Add" : isViewMode ? "View" : "Edit";
  };

  const defaultShares: {
    payeeId: string;
    name: string;
    share: string;
  }[] = group.users.map((x: { id: string; name: string }) => ({
    payeeId: x.id,
    name: x.name,
    share: "1",
  }));

  const defaultValues = isAddMode
    ? {
        amount: "",
        description: "",
        payerId: "",
        note: "",
        shares: defaultShares,
        currency: group.lastusedcurrency || "",
      }
    : {
        amount: expense?.amount.toString(),
        description: expense?.description || "",
        payerId: expense?.payerid || "",
        note: expense?.note || "",
        shares: defaultShares.map((share) => ({
          payeeId: share.payeeId,
          name: share.name,
          share:
            expense?.shares
              .find((s) => s.payeeid === share.payeeId)
              ?.share.toString() || "0",
        })),
        currency: expense?.currency,
      };

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
    getValues,
    setValue,
    reset,
  } = useForm<AddExpenseFormInputs>({
    mode: "all",
    defaultValues: defaultValues,
  });

  const onSubmit: SubmitHandler<AddExpenseFormInputs> = async (data) => {
    const amount = parseFloat(data.amount);
    const sharesWithAmounts = calculateSharesWithAmount(
      data.shares,
      data.currency,
      amount
    );

    let toastMessage = "";

    if (isAddMode) {
      await addExpense(
        group.id,
        amount,
        data.currency,
        sharesWithAmounts,
        data.payerId,
        data.description.trim(),
        data.note?.trim()
      );

      toastMessage = "Expense added successfully!";

      reset({
        amount: "",
        description: "",
        currency: data.currency,
        payerId: data.payerId,
        note: "",
        shares: defaultShares,
      });
    } else {
      await editExpense(
        expense?.id!,
        group.id,
        amount,
        data.currency,
        sharesWithAmounts,
        data.payerId,
        data.description.trim(),
        data.note?.trim()
      );

      toastMessage = "Expense edited successfully!";
      setIsViewMode(true);
    }

    successToast(toastMessage, theme === "dark" ? "dark" : "light");
  };

  const checkAllSharesEqual = () => {
    const shares = getValues("shares");

    return shares.every((s) => s.share == "0" || s.share === shares[0].share);
  };

  return (
    <>
      <form className="grid gap-2" onSubmit={handleSubmit(onSubmit)}>
        <Card shadow="none" className="bg-transparent" fullWidth>
          <CardBody className="gap-2">
            <Controller
              name="description"
              control={control}
              rules={{ required: "description is required" }}
              render={({ field, fieldState }) => (
                <Input
                  label="Description"
                  isDisabled={isViewMode}
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  {...field}
                />
              )}
            />

            <Controller
              name="currency"
              control={control}
              rules={{ required: "currency is required" }}
              render={({ field, fieldState }) => (
                <Autocomplete
                  defaultItems={currencies}
                  label="Currency"
                  isDisabled={isViewMode}
                  defaultSelectedKey={defaultValues.currency}
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  onSelectionChange={field.onChange}
                  {...field}
                >
                  {(item) => (
                    <AutocompleteItem
                      key={item.code}
                    >{`${item.code}: ${item.currency}`}</AutocompleteItem>
                  )}
                </Autocomplete>
              )}
            />

            <Controller
              name="amount"
              control={control}
              rules={{
                required: "amount is required",
                validate: (value) =>
                  /^(?:[1-9]\d*|0)?(?:\.\d+)?$/.test(value) ||
                  "amount should be postive number",
              }}
              render={({ field, fieldState }) => (
                <Input
                  label="Amount"
                  isDisabled={isViewMode}
                  type="number"
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  {...field}
                  value={field.value}
                />
              )}
            />

            <Controller
              name="payerId"
              control={control}
              rules={{ required: "paid by field is required" }}
              render={({ field, fieldState }) => (
                <Select
                  label="Paid By"
                  isDisabled={isViewMode}
                  classNames={{
                    value: "text-black",
                  }}
                  defaultSelectedKeys={
                    defaultValues.payerId ? [defaultValues.payerId] : undefined
                  }
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  {...field}
                >
                  {group.users.map((user: { id: string; name: string }) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />

            <Controller
              name="note"
              control={control}
              render={({ field, fieldState }) => (
                <Textarea
                  label="Note"
                  isDisabled={isViewMode}
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  {...field}
                />
              )}
            />

            <div className="text-center">
              split{" "}
              <Chip>{checkAllSharesEqual() ? "equally" : "unequally"}</Chip>{" "}
              between{" "}
              <Chip>
                {
                  getValues("shares").filter((s) => s.share && s.share !== "0")
                    .length
                }
              </Chip>{" "}
              people
            </div>
          </CardBody>

          <CardFooter className="flex-col gap-2">
            {isViewMode ? (
              <>
                <Button className="w-full" onPress={onOpen}>
                  View Split
                </Button>
                <Button
                  type="button"
                  isLoading={isSubmitting}
                  color="primary"
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsViewMode(false);
                  }}
                >
                  Edit Expense
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full" onPress={onOpen}>
                  Modify Split
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  color="primary"
                  className="w-full"
                >
                  {getMode() === "Add" ? "Add Expense" : "Confirm Changes"}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </form>

      {isOpen && (
        <SharesModal
          shares={getValues("shares")}
          onOpenChange={onOpenChange}
          mode={getMode()}
          setShares={(
            shares: { payeeId: string; name: string; share: string }[]
          ): void => {
            setValue("shares", shares);
          }}
        />
      )}
    </>
  );
}
