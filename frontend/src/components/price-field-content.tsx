'use client';
import { formatNumber } from '@/utils';

type PriceFieldContentProps = {
  value: number;
  quantity: number;
};

export default function PriceFieldContent({
  value,
  quantity,
}: PriceFieldContentProps) {
  return (
    <>
      <span>
        {formatNumber(value)} [{formatNumber(value / quantity)} ea.]
      </span>
    </>
  );
}
