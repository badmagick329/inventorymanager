import { SalesInfoCardField } from '@/components';

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
    <div className='flex w-1/2 max-w-xs flex-col items-center justify-center gap-2'>
      <span className='text-lg font-semibold sm:text-xl'>{name}</span>
      <div className='flex w-full max-w-xs rounded-md bg-neutral-500 py-[1px]'></div>
      <SalesInfoCardField
        label='Purchase Price'
        value={pricePerItem * quantity}
        perItemValue={pricePerItem}
      />
      <SalesInfoCardField
        label='Sale Price'
        value={currentSalePrice * quantity}
        perItemValue={currentSalePrice}
      />
      <div className='flex w-full max-w-xs justify-between'>
        <span className='text-sm font-semibold sm:text-base'>Remaining</span>
        <span className='text-sm sm:text-base'>{remainingStock}</span>
      </div>
    </div>
  );
}
