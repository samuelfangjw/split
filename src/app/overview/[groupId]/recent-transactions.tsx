import { getGroupTransactions } from "@/app/lib/transactions";
import { Card, CardBody, CardFooter, Link } from "@nextui-org/react";

export default async function GroupLink(params: { groupId: string }) {
  const groupId = params.groupId;
  let transactions = await getGroupTransactions(groupId);

  const formatDescription = (item: {
    id: string;
    payerid: string;
    payername: string;
    amount: number;
    currency: string;
    createdat: Date;
    type: string;
    description?: string | null;
    payeeid?: string;
    payeename?: string;
  }) => {
    if (item.type === "payment") {
      return (
        <p>
          {item.payername} paid {item.currency} {item.amount} to{" "}
          {item.payeename}
        </p>
      );
    }

    // item.type === "expense"
    return (
      <p>
        {item.payername} paid {item.currency} {item.amount} for{" "}
        {item.description}
      </p>
    );
  };

  const formatDate = (date: Date) => {
    const days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

    return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}`;
  };

  if (!transactions || !transactions.length) {
    return <></>;
  }

  return (
    <div>
      <h2 className="text-xl">Recent Transactions</h2>
      {transactions.map((transaction) => (
        <Card
          className="my-2 w-full"
          key={transaction.id}
          as={Link}
          isPressable
          href={
            transaction.type === "expense"
              ? `/expenses/${groupId}?expenseId=${transaction.id}`
              : `/debts/${groupId}`
          }
        >
          <CardBody>{formatDescription(transaction)}</CardBody>
          <CardFooter>{formatDate(transaction.createdat)}</CardFooter>
        </Card>
      ))}
    </div>
  );
}
