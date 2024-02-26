import { HistoricalOrder } from '@/types';
import HistoricalOrderCard from './order-history-card';
import { ICON_MD } from '@/consts';
import { MoveRight } from 'lucide-react';

export default function OrderChangeCards({
  first,
  last,
}: {
  first: HistoricalOrder;
  last: HistoricalOrder | null;
}) {
  return (
    <div className='flex w-full flex-wrap gap-2'>
      {last && (
        <div className='flex items-center gap-2'>
          <div className='flex flex-col items-center gap-2'>
            <span>Oldest</span>
            <HistoricalOrderCard order={last} />
          </div>
          <MoveRight size={ICON_MD} />
        </div>
      )}
      <div className='flex flex-col items-center gap-2'>
        <span>Latest</span>
        <HistoricalOrderCard order={first} />
      </div>
    </div>
  );
}
