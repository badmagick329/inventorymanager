'use client';

import { formatCurrency, formatNumber } from '@/utils';
import { Tooltip } from "@heroui/react";

type PriceFieldContentProps = {
  value: number;
  quantity?: number;
  calculatedValue?: number;
};

export default function PriceFieldContent({
  value,
  quantity,
  calculatedValue,
}: PriceFieldContentProps) {
  return (
    <div className='flex items-start gap-1'>
      <Tooltip content={formatCurrency(value)} placement='top'>
        <span className='text-sm sm:text-base'>{formatNumber(value)}</span>
      </Tooltip>
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
      <>
        <Tooltip content={formatCurrency(value / quantity)} placement='top'>
          <span className='text-xs text-default-500'>
            {formatNumber(value / quantity)}ea.
          </span>
        </Tooltip>
      </>
    );
  }
  if (calculatedValue !== undefined) {
    if (calculatedValue === 0) {
      return null;
    }
    return (
      <>
        <Tooltip content={formatCurrency(calculatedValue)} placement='top'>
          <span className='text-xs text-default-500'>
            {formatNumber(calculatedValue)}ea.
          </span>
        </Tooltip>
      </>
    );
  }
}
