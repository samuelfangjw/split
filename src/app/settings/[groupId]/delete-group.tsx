"use client";

import { deleteGroup } from "@/app/lib/groups";
import { successToast } from "@/app/lib/toast";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { groups } from "@prisma/client";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteGroupSection({
  group,
}: {
  group: Omit<groups, "password">;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  const recordPayment = async () => {
    setIsDeletingGroup(true);

    deleteGroup(group.id);

    setIsDeletingGroup(false);
    router.push("/");

    successToast(
      "Group deleted successfully!",
      theme === "dark" ? "dark" : "light"
    );
  };

  return (
    <>
      <Button color="danger" onClick={onOpen}>
        Delete Group
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Group
              </ModalHeader>

              <ModalBody>
                <p>
                  Are you sure you want to delete the group
                  <b>{group.name}</b>?
                </p>
              </ModalBody>

              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={() => {
                    recordPayment();
                    onClose();
                  }}
                  isLoading={isDeletingGroup}
                >
                  Confirm Delete Group
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
