"use client";

import { addPayment } from "@/app/lib/transactions";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettleDebtModal({
  groupId,
  debt,
}: {
  groupId: string;
  debt: {
    payeeid: string;
    payeename: string;
    payerid: string;
    payername: string;
    currency: string;
    amount: number;
  };
}) {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const recordPayment = async () => {
    setIsRecordingPayment(true);

    // in debts screen, original payee owes original payer
    // when recording payment, flip payee and payer
    await addPayment(
      groupId,
      debt.amount,
      debt.currency,
      debt.payerid,
      debt.payeeid
    );

    setIsRecordingPayment(false);
    router.refresh();
  };

  return (
    <>
      <Button color="primary" size="sm" className="ml-2" onClick={onOpen}>
        Settle Up
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Record a payment
              </ModalHeader>

              <ModalBody>
                <p>
                  <b>{debt.payeename}</b> has paid{" "}
                  <b>
                    {debt.currency} {debt.amount}
                  </b>{" "}
                  to <b>{debt.payername}</b>.
                </p>
              </ModalBody>

              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    recordPayment();
                    onClose();
                  }}
                  isLoading={isRecordingPayment}
                >
                  Record Payment
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
