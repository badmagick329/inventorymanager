'use client';
import { formatNumber } from '@/utils';

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
      <span>{formatNumber(value)}</span>
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
  console.log('calculated value got: ', value, quantity, calculatedValue);
  if (quantity !== undefined && quantity > 1) {
    if (value === 0) {
      return null;
    }
    return (
      <span className='text-xs text-default-500'>
        {formatNumber(value / quantity)}ea.
      </span>
    );
  }
  if (calculatedValue !== undefined) {
    if (calculatedValue === 0) {
      return null;
    }
    return (
      <span className='text-xs text-default-500'>
        {formatNumber(calculatedValue)}ea.
      </span>
    );
  }
}
