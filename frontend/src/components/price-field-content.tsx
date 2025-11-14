'use client';

import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/utils';

type PriceFieldContentProps = {
  value: number;
  quantity?: number;
  calculatedValue?: number;
  className?: string;
};

export default function PriceFieldContent({
  value,
  quantity,
  calculatedValue,
  className,
}: PriceFieldContentProps) {
  return (
    <div className={cn('flex flex-col items-end gap-1', className)}>
      <abbr
        className='text-sm no-underline sm:text-base'
        title={formatCurrency(value)}
      >
        {formatNumber(value)}
      </abbr>
      <CalculatedValue
        value={value}
        quantity={quantity}
        calculatedValue={calculatedValue}
      />
    </div>
  );
}

function CalculatedValue({
  value,
  quantity,
  calculatedValue,
}: PriceFieldContentProps) {
  if (quantity !== undefined && quantity > 1) {
    if (value === 0) {
      return null;
    }
    return (
      <abbr
        className='text-[0.5rem] text-foreground/60 no-underline sm:text-[0.75rem]'
        title={formatCurrency(value / quantity)}
      >
        {formatNumber(value / quantity)}ea.
      </abbr>
    );
  }
  if (calculatedValue !== undefined) {
    if (calculatedValue === 0) {
      return null;
    }
    return (
      <abbr
        className='text-[0.5rem] text-foreground/60 no-underline sm:text-[0.75rem]'
        title={formatCurrency(calculatedValue)}
      >
        {formatNumber(calculatedValue)}ea.
      </abbr>
    );
  }
}
