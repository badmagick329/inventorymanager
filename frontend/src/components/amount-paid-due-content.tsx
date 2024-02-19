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
      <span className={amountPaidColor}>{formatNumber(amountPaid)}</span>
      <span> / </span>
      <span className={debtColor}>{formatNumber(debt)}</span>
    </>
  );
}
