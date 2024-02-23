'use client';

import PriceFieldContent from '@/components/price-field-content';

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
    <div className='flex w-full flex-col items-center justify-center gap-2'>
      <span className='text-2xl font-semibold'>{name}</span>
      <div className='flex w-full max-w-xs rounded-md bg-neutral-500 py-[1px]'></div>
      <CardField
        label='Purchase Price'
        value={pricePerItem * quantity}
        perItemValue={pricePerItem}
      />
      <CardField
        label='Sale Price'
        value={currentSalePrice * quantity}
        perItemValue={currentSalePrice}
      />
      <div className='flex w-full max-w-xs justify-between'>
        <span className='font-semibold'>Remaining</span>
        <span>{remainingStock}</span>
      </div>
    </div>
  );
}

function CardField({
  label,
  value,
  perItemValue,
}: {
  label: string;
  value: number;
  perItemValue: number;
}) {
  return (
    <div className='flex w-full max-w-xs justify-between'>
      <span className='font-semibold'>{label}</span>
      <PriceFieldContent value={value} calculatedValue={perItemValue} />
    </div>
  );
}
