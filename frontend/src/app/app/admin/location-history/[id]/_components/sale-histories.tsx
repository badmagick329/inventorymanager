import { SaleHistory } from '@/types';
import SaleHistoryAccordian from './sales-history-accordian';
import { Accordion, AccordionItem } from '@nextui-org/react';

export default function SaleHistories({
  saleHistories,
}: {
  saleHistories: SaleHistory[];
}) {
  const totalChanges = saleHistories.reduce(
    (acc, sale) => acc + sale.deltas.length,
    0
  );
  const saleHistoriesWithDelta = saleHistories.filter(
    (sale) => sale.deltas.length > 0
  );
  const saleText = saleHistoriesWithDelta.length > 1 ? 'sales' : 'sale';
  const changeText = totalChanges > 1 ? 'changes' : 'change';
  return (
    <div className='flex flex-col gap-4 rounded-md border-1 border-default-500'>
      <Accordion selectionMode='multiple'>
        <AccordionItem
          aria-label='Sale History'
          title={
            <div className='flex w-full gap-4'>
              <span>
                {`${saleHistoriesWithDelta.length} ${saleText} with `}
                {`${totalChanges} ${changeText} in total`}
              </span>
            </div>
          }
        >
          {saleHistories.map((sale, i) => (
            <SaleHistoryAccordian key={i} saleHistory={sale} />
          ))}
        </AccordionItem>
      </Accordion>
    </div>
  );
}
