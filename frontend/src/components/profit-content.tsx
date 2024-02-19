'use client';
import { formatNumber } from '@/utils';

type ProfitContentProps = {
  profit: number;
  profitPerItem: number;
};

export default function ProfitContent({
  profit,
  profitPerItem,
}: ProfitContentProps) {
  return (
    <>
      <span className={getProfitColor(profit)}>
        {formatNumber(profit)} [{formatNumber(profitPerItem)} ea.]
      </span>
    </>
  );
}

function getProfitColor(profit: number) {
  if (profit === 0) {
    return 'text-foreground';
  } else if (profit < 0) {
    return 'text-danger-500';
  } else {
    return 'text-success-600';
  }
}
