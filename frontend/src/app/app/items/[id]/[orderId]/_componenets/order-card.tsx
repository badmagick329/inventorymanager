'use client';

import { formatNumber } from '@/utils';

type OrderCardProps = {
  name: string;
  pricePerItem: number;
  quantity: number;
  currentSalePrice: number;
  remainingStock: number;
};

export default function OrderCard({
  name,
  pricePerItem,
  quantity,
  currentSalePrice,
  remainingStock,
}: OrderCardProps) {
  return (
    <div className='flex flex-col items-center gap-2'>
      <span className='text-2xl font-semibold'>{name}</span>
      <span className='font-semibold'>
        Purchase Price: {formatNumber(pricePerItem * quantity)} [
        {formatNumber(pricePerItem)} ea.]
      </span>
      <span className='font-semibold'>
        Current sale price: {formatNumber(currentSalePrice * quantity)} [
        {formatNumber(currentSalePrice)} ea.]
      </span>
      <span className='font-semibold'>Remaining stock: {remainingStock}</span>
    </div>
  );
}
