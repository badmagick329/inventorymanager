import { SaleHistory } from '@/types';
import SaleHistoryAccordian from './sales-history-accordian';

export default function SaleHistories({
  saleHistories,
}: {
  saleHistories: SaleHistory[];
}) {
  const totalChanges = saleHistories.reduce(
    (acc, sale) => acc + sale.deltas.length,
    0
  );
  if (saleHistories.length === 0) {
    return null;
  }
  return (
    <div className='boder-default-500 flex flex-col rounded-md border-1'>
      {saleHistories.map((sale, i) => (
        <SaleHistoryAccordian key={i} saleHistory={sale} />
      ))}
    </div>
  );
}
