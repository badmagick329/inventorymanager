import React from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { SaleHistory } from '@/types';
import DeltasList from './deltas-list';
import SaleChangeCards from './sale-change-cards';
import { ICON_MD } from '@/consts';
import { DollarSign } from 'lucide-react';
import { injectDeltasWithUser } from '@/utils';

export default function SaleHistoryAccordian({
  saleHistory,
}: {
  saleHistory: SaleHistory;
}) {
  if (saleHistory.deltas.length === 0) {
    return null;
  }
  saleHistory.deltas = injectDeltasWithUser(
    saleHistory.deltas,
    saleHistory.first.lastModifiedBy || ''
  );
  const totalChanges = saleHistory.deltas.filter(
    (delta) => delta.changes.length > 0
  ).length;
  const changeText = totalChanges > 1 ? 'changes' : 'change';
  return (
    <Accordion selectionMode='multiple'>
      <AccordionItem
        aria-label='Sale History'
        title={
          <div className='flex w-full gap-4'>
            <DollarSign size={ICON_MD} />
            <span>Sale to {saleHistory.first.vendor}</span>
            <span className='text-xs text-default-500'>
              {totalChanges} {`${changeText}`} - since{' '}
              {saleHistory.first.created}
            </span>
          </div>
        }
      >
        <div className='flex w-full flex-col gap-4 px-2'>
          <SaleChangeCards first={saleHistory.first} last={saleHistory.last} />
          <DeltasList deltas={saleHistory.deltas} />
        </div>
      </AccordionItem>
    </Accordion>
  );
}
