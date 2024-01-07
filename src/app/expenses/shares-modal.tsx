import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";

type CustomSharesFormInputs = {
  shares: {
    payeeId: string;
    name: string;
    share: string;
  }[];
};

export default function SharesModal({
  shares,
  onOpenChange,
  setShares,
  mode,
}: {
  shares: {
    payeeId: string;
    name: string;
    share: string;
  }[];
  onOpenChange: () => void;
  setShares: (
    shares: { payeeId: string; name: string; share: string }[]
  ) => void;
  mode: "Edit" | "Add" | "View";
}) {
  const {
    handleSubmit,
    control,
    getValues,
    watch,
    formState: { isSubmitting },
  } = useForm<CustomSharesFormInputs>({
    mode: "all",
    defaultValues: {
      shares: shares,
    },
  });

  const { fields } = useFieldArray<CustomSharesFormInputs>({
    name: "shares",
    control,
  });

  const onSubmit: SubmitHandler<CustomSharesFormInputs> = async (data) => {
    setShares(data.shares);
  };

  return (
    <Modal isOpen={true} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <form
            onSubmit={handleSubmit((data) => {
              onSubmit(data);
              onClose();
            })}
          >
            <ModalHeader className="flex flex-col gap-1">
              Custom Split
            </ModalHeader>

            <ModalBody>
              <p>
                Split by Shares. Each person pays in proportion to the number of
                shares they have.
              </p>
            </ModalBody>

            <ModalBody>
              {fields.map((field, index) => (
                <div
                  key={field.payeeId}
                  className="flex flex-nowrap justify-between"
                >
                  <p>{field.name}</p>
                  <Controller
                    name={`shares.${index}.share`}
                    control={control}
                    rules={{
                      required: "Share cannot be empty",
                      validate: (value) => {
                        const nonEmptyCount = getValues("shares").filter(
                          (s) => s.share && s.share !== "0"
                        ).length;

                        if (nonEmptyCount == 0) {
                          return "at least one share required";
                        }

                        if (!/^(?:[1-9]\d*|0)?(?:\.\d+)?$/.test(value)) {
                          return "shares should be a positive number";
                        }
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <div>
                        <Input
                          variant="bordered"
                          isDisabled={mode === "View"}
                          type="number"
                          size="sm"
                          isInvalid={!!fieldState.error}
                          errorMessage={fieldState.error?.message}
                          {...field}
                        />
                      </div>
                    )}
                  />
                </div>
              ))}
              <p>
                Total Shares:{" "}
                {watch("shares").reduce(
                  (acc, s) => acc + (parseInt(s.share) || 0),
                  0
                )}
              </p>
            </ModalBody>

            <ModalFooter>
              {mode === "View" ? (
                <Button type="button" color="primary" onPress={onClose}>
                  Close
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    color="danger"
                    variant="light"
                    onPress={onClose}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" color="primary" isLoading={isSubmitting}>
                    Confirm
                  </Button>
                </>
              )}
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
