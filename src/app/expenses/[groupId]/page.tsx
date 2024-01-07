import { getGroup } from "@/app/lib/groups";
import ExpenseForm from "../expense-form";
import { getExpense } from "@/app/lib/transactions";
import { notFound } from "next/navigation";

export default async function AddExpensePage({
  params,
  searchParams,
}: {
  params: { groupId: string };
  searchParams: { expenseId: string };
}) {
  const groupId = params.groupId;
  const expenseId = searchParams.expenseId;
  const expense = await getExpense(groupId, expenseId);
  const group = await getGroup(groupId);

  if (!expenseId) {
    notFound();
  }

  return (
    <main className="w-full p-4 max-w-md">
      <ExpenseForm group={group} expense={expense} />
    </main>
  );
}
