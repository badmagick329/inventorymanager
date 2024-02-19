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
  return (
    <>
      <span className={getAmountPaidColor(amountPaid)}>
        {formatNumber(amountPaid)}
      </span>
      <span> / </span>
      <span className={getDebtColor(debt)}>{formatNumber(debt)}</span>
    </>
  );
}

function getAmountPaidColor(amountPaid: number) {
  return amountPaid > 0 ? 'text-success-600' : 'text-foreground';
}

function getDebtColor(debt: number) {
  return debt > 0 ? 'text-danger-500' : 'text-foreground';
}
