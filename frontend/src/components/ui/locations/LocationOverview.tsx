import { ShoppingCart, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { formatNumber } from '@/utils/helpers';

type Props = {
  items: number;
  purchaseAmount: number;
  salesAmount: number;
};

export default function LocationOverview({
  items,
  purchaseAmount,
  salesAmount,
}: Props) {
  return (
    <div className='flex gap-2 self-center'>
      <div>
        <ShoppingCart className='h-4 w-4' />
        <span>{formatNumber(items)}</span>
      </div>
      <div className='text-danger'>
        <ArrowDownIcon className='h-4 w-4' />
        <span>{formatNumber(purchaseAmount)}</span>
      </div>
      <div className='text-success'>
        <ArrowUpIcon className='h-4 w-4' />
        <span>{formatNumber(salesAmount)}</span>
      </div>
    </div>
  );
}
