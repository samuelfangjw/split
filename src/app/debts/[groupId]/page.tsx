import { getConsolidatedDebts } from "@/app/lib/transactions";
import SettleDebtModal from "./settle-debt-modal";

export default async function SettleDebtsPage({
  params,
}: {
  params: { groupId: string };
}) {
  const groupId = params.groupId;

  const debts = await getConsolidatedDebts(groupId);

  return (
    <main className="w-full p-4 max-w-md">
      {debts.length > 0 ? (
        debts.map((debt, idx) => (
          <div key={idx} className="flex justify-between text-nowrap p-2">
            <div>
              <b>{debt.payeename}</b> owes <b>{debt.payername}</b>{" "}
              {debt.currency} <b>{debt.amount}</b>
            </div>
            <SettleDebtModal groupId={groupId} debt={debt} />
          </div>
        ))
      ) : (
        <div>All settled up!</div>
      )}
    </main>
  );
}
