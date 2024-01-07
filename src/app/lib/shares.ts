import { default as currencyJs } from "currency.js";
import { getMinorUnits } from "./currencies";

export const calculateSharesWithAmount = (
  shares: {
    payeeId: string;
    name: string;
    share: string;
  }[],
  currency: string,
  amount: number
) => {
  const minorUnits = getMinorUnits(currency);
  const totalAmount = currencyJs(amount, {
    precision: minorUnits,
  });

  const sanitizedShares = shares
    .map((s) => ({
      name: s.name,
      payeeId: s.payeeId,
      share: parseInt(s.share),
      amount: 0,
    }))
    .filter((s) => s.share > 0);

  const totalShares = sanitizedShares.reduce((acc, curr) => {
    return acc + curr.share;
  }, 0);

  let totalAmountBeforeCorrection = currencyJs(0, {
    precision: minorUnits,
  });
  for (let i = 0; i < sanitizedShares.length; i++) {
    const s = sanitizedShares[i];
    const amount = totalAmount.multiply(s.share / totalShares);
    s.amount = amount.value;
    totalAmountBeforeCorrection = totalAmountBeforeCorrection.add(s.amount);
  }

  // distribute leftover amount randomly
  const amountToDistribute = totalAmount
    .subtract(totalAmountBeforeCorrection)
    .distribute(sanitizedShares.length)
    .sort(() => Math.random() - 0.5);
  for (let i = 0; i < sanitizedShares.length; i++) {
    const s = sanitizedShares[i];
    s.amount = amountToDistribute[i].add(s.amount).value;
  }

  return sanitizedShares;
};
