import React from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { SaleHistory } from '@/types';
import DeltasList from './deltas-list';
import SaleChangeCards from './sale-change-cards';
import { ICON_MD } from '@/consts';
import { DollarSign } from 'lucide-react';
import { injectDeltasWithUser } from '@/utils';
import { useMemo } from 'react';
import ItemChangeText from '@/components/item-change-text';
import { UTCStringtoLocalDate } from '@/utils';

export default function SaleHistoryAccordian({
  saleHistory,
}: {
  saleHistory: SaleHistory;
}) {
  const deltas = useMemo(() => {
    return injectDeltasWithUser(
      saleHistory.deltas,
      saleHistory.first.lastModifiedBy || ''
    );
  }, [saleHistory.deltas, saleHistory.first.lastModifiedBy]);

  const totalChanges = useMemo(() => {
    return deltas.filter((delta) => delta.changes.length > 0).length;
  }, [deltas]);

  return (
    <Accordion selectionMode='multiple'>
      <AccordionItem
        aria-label='Sale History'
        title={
          <div className='flex w-full gap-4'>
            <DollarSign size={ICON_MD} />
            <span
              className={
                saleHistory.first.deleted
                  ? `text-danger-500`
                  : `text-foreground`
              }
            >
              Sale to {saleHistory.first.vendor}
            </span>
            <ItemChangeText
              totalChanges={totalChanges}
              created={saleHistory.first.created}
              lastModifiedBy={saleHistory.first.lastModifiedBy}
              lastModified={UTCStringtoLocalDate(
                saleHistory.first.lastModified
              ).toLocaleString()}
            />
          </div>
        }
      >
        <div className='flex w-full flex-col gap-4 px-2'>
          <SaleChangeCards first={saleHistory.first} last={saleHistory.last} />
          <DeltasList deltas={deltas} />
        </div>
      </AccordionItem>
    </Accordion>
  );
}
