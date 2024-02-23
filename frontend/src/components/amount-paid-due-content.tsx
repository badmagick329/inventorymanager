'use client';
import { formatNumber } from '@/utils';

type AmountPaidDueContentProps = {
  amountPaid: number;
  debt: number;
};

export default function AmountPaidDueContent({
  amountPaid,
  debt,
}: AmountPaidDueContentProps) {
  const amountPaidColor =
    amountPaid > 0 ? 'text-success-600' : 'text-foreground';
  const debtColor = debt > 0 ? 'text-danger-500' : 'text-foreground';
  return (
    <>
      <AmountPaid amountPaid={amountPaid} amountPaidColor={amountPaidColor} />
      <Divider amountPaid={amountPaid} debt={debt} />
      <Debt debt={debt} debtColor={debtColor} />
    </>
  );
}

function AmountPaid({
  amountPaid,
  amountPaidColor,
}: {
  amountPaid: number;
  amountPaidColor: string;
}) {
  if (amountPaid <= 0) {
    return null;
  }
  return <span className={amountPaidColor}>{formatNumber(amountPaid)}</span>;
}

function Divider({ amountPaid, debt }: { amountPaid: number; debt: number }) {
  if (amountPaid <= 0 || debt <= 0) {
    return null;
  }
  return <span> / </span>;
}

function Debt({ debt, debtColor }: { debt: number; debtColor: string }) {
  if (debt <= 0) {
    return null;
  }
  return <span className={debtColor}>{formatNumber(debt)}</span>;
}
