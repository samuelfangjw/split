import { getGroup } from "@/app/lib/groups";
import ExpenseForm from "../../expense-form";

export default async function AddExpensePage({
  params,
}: {
  params: { groupId: string };
}) {
  const groupId = params.groupId;
  const group = await getGroup(groupId);

  return (
    <main className="w-full p-4 max-w-md">
      <ExpenseForm group={group} expense={null} />
    </main>
  );
}
