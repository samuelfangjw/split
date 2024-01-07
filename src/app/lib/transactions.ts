"use server";

import { z } from "zod";
import { getAndVerifyToken } from "./auth";
import prisma from "../prisma";
import { getMinorUnits } from "@/app/lib/currencies";
import currency, { default as currencyjs } from "currency.js";
import { notFound } from "next/navigation";

export async function getGroupTransactions(groupId: string) {
  try {
    z.string().uuid().parse(groupId);
  } catch (e) {
    throw new Error("Invalid Group ID");
  }

  const token = await getAndVerifyToken();
  if (!token.isValidToken) {
    throw new Error("Unauthorized");
  } else if (!token.isValidForId(groupId)) {
    throw new Error("Forbidden");
  }

  const transactions: {
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
  }[] = [];

  const expenses = await prisma.expenses.findMany({
    where: {
      groupid: groupId,
    },
    include: {
      users: true,
    },
  });

  for (let i = 0; i < expenses.length; i++) {
    const expense = expenses[i];

    transactions.push({
      id: expense.id,
      payerid: expense.payerid,
      payername: expense.users?.name,
      amount: expense.amount,
      description: expense.description,
      currency: expense.currency,
      createdat: expense.createdat,
      type: "expense",
    });
  }

  const payments = await prisma.payments.findMany({
    where: {
      groupid: groupId,
    },
    include: {
      users_payments_payeeidTousers: true,
      users_payments_payeridTousers: true,
    },
  });

  for (let i = 0; i < payments.length; i++) {
    const payment = payments[i];

    transactions.push({
      id: payment.id,
      payerid: payment.payerid,
      payername: payment.users_payments_payeridTousers?.name,
      payeeid: payment.payeeid,
      payeename: payment.users_payments_payeeidTousers?.name,
      amount: payment.amount,
      currency: payment.currency,
      createdat: payment.createdat,
      type: "payment",
    });
  }

  transactions.sort((a, b) => b.createdat.getTime() - a.createdat.getTime());

  return transactions;
}

export async function getConsolidatedDebts(groupId: string) {
  z.string().uuid().parse(groupId);

  const token = await getAndVerifyToken();
  if (!token.isValidToken) {
    throw new Error("Unauthorized");
  } else if (!token.isValidForId(groupId)) {
    throw new Error("Forbidden");
  }

  const users = await prisma.users.findMany({
    where: {
      groupid: groupId,
    },
  });

  const debts: {
    [currency: string]: { [payee: string]: { [payer: string]: currency } };
  } = {};

  const recordDebt = (
    payee: string,
    payer: string,
    currency: string,
    amount: number
  ) => {
    if (!(currency in debts)) {
      debts[currency] = {};
    }

    if (!(payee in debts[currency])) {
      debts[currency][payee] = {};
    }

    if (!(payer in debts[currency][payee])) {
      const minorUnits = getMinorUnits(currency);
      debts[currency][payee][payer] = currencyjs(0, { precision: minorUnits });
    }

    debts[currency][payee][payer] = debts[currency][payee][payer].add(amount);
  };

  const recordLoan = (
    payee: string,
    payer: string,
    currency: string,
    amount: number
  ) => {
    recordDebt(payer, payee, currency, -amount);
  };

  const expenses = await prisma.expenses.findMany({
    where: {
      groupid: groupId,
    },
    include: {
      shares: true,
    },
  });

  for (let i = 0; i < expenses.length; i++) {
    const expense = expenses[i];
    const shares = expense.shares;
    const payerid = expense.payerid;
    const currency = expense.currency;

    for (let i = 0; i < shares.length; i++) {
      const share = shares[i];
      const payeeid = share.payeeid;
      const amount = share.amount;
      recordDebt(payeeid, payerid, currency, amount);
      recordLoan(payeeid, payerid, currency, amount);
    }
  }

  const payments = await prisma.payments.findMany({
    where: {
      groupid: groupId,
    },
  });

  for (let i = 0; i < payments.length; i++) {
    const payment = payments[i];
    const payerid = payment.payerid;
    const payeeid = payment.payeeid;
    const currency = payment.currency;
    const amount = payment.amount;
    recordDebt(payeeid, payerid, currency, amount);
    recordLoan(payeeid, payerid, currency, amount);
  }

  const consolidatedDebts = [];

  const usersMap: { [userId: string]: string } = {};
  users.forEach((user) => {
    usersMap[user.id] = user.name;
  });

  for (const [currency, payeeObj] of Object.entries(debts)) {
    for (const [payee, payerObj] of Object.entries(payeeObj)) {
      for (const [payer, amount] of Object.entries(payerObj)) {
        if (amount.value > 0) {
          consolidatedDebts.push({
            payeeid: payee,
            payeename: usersMap[payee],
            payerid: payer,
            payername: usersMap[payer],
            currency: currency,
            amount: amount.value,
          });
        }
      }
    }
  }

  return consolidatedDebts;
}

export async function getExpense(groupId: string, expenseId: string) {
  const token = await getAndVerifyToken();
  if (!token.isValidToken) {
    throw new Error("Unauthorized");
  } else if (!token.isValidForId(groupId)) {
    throw new Error("Forbidden");
  }

  const expense = await prisma.expenses.findUnique({
    where: {
      id: expenseId,
      groupid: groupId,
    },
    include: {
      shares: true,
    },
  });

  if (!expense) {
    notFound();
  }

  return expense;
}

export async function addExpense(
  groupId: string,
  amount: number,
  currency: string,
  shares: {
    name: string;
    payeeId: string;
    share: number;
    amount: number;
  }[],
  payerId: string,
  description: string,
  note: string
) {
  const token = await getAndVerifyToken();
  if (!token.isValidToken) {
    throw new Error("Unauthorized");
  } else if (!token.isValidForId(groupId)) {
    throw new Error("Forbidden");
  }

  await prisma.$transaction(async (tx) => {
    const expense = await tx.expenses.create({
      data: {
        groupid: groupId,
        payerid: payerId,
        amount: amount,
        currency: currency,
        note: note,
        description: description,
        createdat: new Date(),
      },
    });

    const expenseId = expense.id;
    await tx.shares.createMany({
      data: shares.map((share) => ({
        expenseid: expenseId,
        payeeid: share.payeeId,
        share: share.share,
        amount: share.amount,
      })),
    });

    await tx.groups.update({
      where: {
        id: groupId,
      },
      data: {
        lastusedcurrency: currency,
      },
    });
  });
}

export async function editExpense(
  expenseId: string,
  groupId: string,
  amount: number,
  currency: string,
  shares: {
    name: string;
    payeeId: string;
    share: number;
    amount: number;
  }[],
  payerId: string,
  description: string,
  note: string
) {
  const token = await getAndVerifyToken();
  if (!token.isValidToken) {
    throw new Error("Unauthorized");
  } else if (!token.isValidForId(groupId)) {
    throw new Error("Forbidden");
  }

  await prisma.$transaction(async (tx) => {
    await tx.expenses.update({
      where: {
        id: expenseId
      },
      data: {
        groupid: groupId,
        payerid: payerId,
        amount: amount,
        currency: currency,
        note: note,
        description: description,
      },
    });

    await tx.shares.deleteMany({
      where: {
        expenseid: expenseId
      }
    })

    await tx.shares.createMany({
      data: shares.map((share) => ({
        expenseid: expenseId,
        payeeid: share.payeeId,
        share: share.share,
        amount: share.amount,
      })),
    });
  });
}

export async function addPayment(
  id: string,
  amount: number,
  currency: string,
  payeeId: string,
  payerId: string
) {
  const token = await getAndVerifyToken();
  if (!token.isValidToken) {
    throw new Error("Unauthorized");
  } else if (!token.isValidForId(id)) {
    throw new Error("Forbidden");
  }

  await prisma.payments.create({
    data: {
      groupid: id,
      payerid: payerId,
      payeeid: payeeId,
      amount: amount,
      currency: currency,
      createdat: new Date(),
    },
  });
}
