import { ShoppingCart, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { formatNumber } from '@/utils';
import { useIsAdmin } from '@/hooks';

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
  const isAdmin = useIsAdmin();
  if (!isAdmin) {
    return null;
  }
  return (
    <div className='flex gap-2 self-center'>
      <div>
        <ShoppingCart className='icon-sm' />
        <span>{formatNumber(items)}</span>
      </div>
      <div className='text-danger'>
        <ArrowDownIcon className='icon-sm' />
        <span>{formatNumber(purchaseAmount)}</span>
      </div>
      <div className='text-success'>
        <ArrowUpIcon className='icon-sm' />
        <span>{formatNumber(salesAmount)}</span>
      </div>
    </div>
  );
}
