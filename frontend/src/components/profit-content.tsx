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
    <div className='flex gap-1 items-start'>
      <ProfitValue profit={profit} profitPerItem={profitPerItem} />
      <ProfitPerItemValue profitPerItem={profitPerItem} />
    </div>
  );
}

function ProfitValue({ profit, profitPerItem }: ProfitContentProps) {
  return (
    <span className={getColor(profit, profitPerItem)}>
      {formatNumber(profit)}
    </span>
  );
}

function ProfitPerItemValue({ profitPerItem }: { profitPerItem: number }) {
  if (profitPerItem === 0) {
    return null;
  }
  return (
    <span className='text-default-500 text-xs'>
      {formatNumber(profitPerItem)}ea.
    </span>
  );
}

function getColor(profit: number, profitPerItem: number) {
  if (profit < 0 || profitPerItem < 0) {
    return 'text-danger-500';
  } else {
    return 'text-foreground';
  }
}
