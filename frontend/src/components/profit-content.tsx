'use client';

import { formatCurrency, formatNumber } from '@/utils';
import { Tooltip } from "@heroui/react";

type ProfitContentProps = {
  profit: number;
  profitPerItem: number;
};

export default function ProfitContent({
  profit,
  profitPerItem,
}: ProfitContentProps) {
  return (
    <div className='flex items-start gap-1'>
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
        <span className='text-xs text-default-500'>
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
