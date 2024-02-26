import { HistoricalOrder } from '@/types';
import OrderHistoryCard from './order-history-card';
import { ICON_MD } from '@/consts';
import { MoveRight } from 'lucide-react';

export default function OrderChangeCards({
  first,
  last,
  numberOfSales,
}: {
  first: HistoricalOrder;
  last: HistoricalOrder | null;
  numberOfSales: number;
}) {
  return (
    <div className='flex w-full flex-wrap gap-2 px-2'>
      {last && (
        <div className='flex items-center gap-2'>
          <div className='flex flex-col items-center gap-2'>
            <span>Oldest</span>
            <OrderHistoryCard order={last} />
          </div>
          <MoveRight size={ICON_MD} />
        </div>
      )}
      <div className='flex flex-col items-center gap-2'>
        <span>Latest</span>
        <OrderHistoryCard order={first} numberOfSales={numberOfSales} />
      </div>
    </div>
  );
}
