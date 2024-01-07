import { checkGroupExists } from "@/app/lib/groups";
import AuthForm from "./auth-form";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Spacer } from "@nextui-org/react";

export type AuthFormInputs = {
  password: string;
};

export default async function AuthPage({
  params,
}: {
  params: { groupId: string };
}) {
  const groupId: string = params.groupId;

  try {
    z.string().uuid().parse(groupId);
  } catch (e) {
    notFound();
  }

  const doesGroupExist = await checkGroupExists(groupId);
  if (!doesGroupExist) {
    notFound();
  }

  return (
    <main className="w-full p-4 max-w-md">
      <Spacer y={64}/>
      <AuthForm groupId={groupId} />
    </main>
  );
}
