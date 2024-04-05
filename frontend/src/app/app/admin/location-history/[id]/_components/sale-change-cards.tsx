import { ICON_MD } from '@/consts';
import { HistoricalSale } from '@/types';
import { MoveRight } from 'lucide-react';

import SaleHistoryCard from './sale-history-card';

export default function SaleChangeCards({
  first,
  last,
}: {
  first: HistoricalSale;
  last: HistoricalSale | null;
}) {
  return (
    <div className='flex w-full flex-wrap gap-2'>
      {last && (
        <div className='flex items-center gap-2'>
          <div className='flex flex-col items-center gap-2'>
            <span>Oldest</span>
            <SaleHistoryCard sale={last} />
          </div>
          <MoveRight size={ICON_MD} />
        </div>
      )}
      <div className='flex flex-col items-center gap-2'>
        <span>Latest</span>
        <SaleHistoryCard sale={first} />
      </div>
    </div>
  );
}
