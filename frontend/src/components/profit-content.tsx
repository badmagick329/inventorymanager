'use client';
import { formatNumber,formatCurrency } from '@/utils';
import { Tooltip } from '@nextui-org/react';

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
    <>
      <Tooltip content={formatCurrency(profit)} placement='top'>
        <span className={getColor(profit, profitPerItem)}>
          {formatNumber(profit)}
        </span>
      </Tooltip>
    </>
  );
}

function ProfitPerItemValue({ profitPerItem }: { profitPerItem: number }) {
  if (profitPerItem === 0) {
    return null;
  }
  return (
    <>
      <Tooltip content={formatCurrency(profitPerItem)} placement='top'>
        <span className='text-default-500 text-xs'>
          {formatNumber(profitPerItem)}ea.
        </span>
      </Tooltip>
    </>
  );
}

function getColor(profit: number, profitPerItem: number) {
  if (profit < 0 || profitPerItem < 0) {
    return 'text-danger-500';
  } else {
    return 'text-foreground';
  }
}
