import { Button, Link, Spacer } from "@nextui-org/react";
import GroupLink from "./group-link";
import RecentTransactions from "./recent-transactions";
import { getGroup } from "@/app/lib/groups";
import { notFound } from "next/navigation";
import { ExpenseIcon } from "@/app/icons/ExpenseIcon";

export default async function OverviewPage({
  params,
}: {
  params: { groupId: any };
}) {
  const groupId: string = String(params.groupId);
  const group = await getGroup(groupId);

  if (!group) {
    notFound();
  }

  return (
    <main className="w-full p-4 max-w-md">
      {!group.lastusedcurrency && (
        <>
          <GroupLink groupId={groupId} />
          <Spacer y={4} />
        </>
      )}

      <Button
        className="w-full h-32"
        size="lg"
        as={Link}
        href={`/expenses/add/${groupId}`}
      >
        <ExpenseIcon />
        Add an Expense
      </Button>
      <Spacer y={4} />
      <RecentTransactions groupId={groupId} />
    </main>
  );
}
