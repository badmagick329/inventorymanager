import ItemChangeText from '@/components/item-change-text';
import { ICON_MD } from '@/consts';
import { OrderHistory } from '@/types';
import { UTCStringtoLocalDate, injectDeltasWithUser } from '@/utils';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { ShoppingCart } from 'lucide-react';
import React, { useMemo } from 'react';

import DeltasList from './deltas-list';
import OrderChangeCards from './order-change-cards';
import SaleHistories from './sale-histories';

export default function OrderHistoryAccordian({
  orderHistory,
  searchValue,
}: {
  orderHistory: OrderHistory;
  searchValue: string;
}) {
  if (isFiltered(orderHistory, searchValue)) {
    return null;
  }

  const deltas = useMemo(() => {
    return injectDeltasWithUser(
      orderHistory.deltas,
      orderHistory.first.lastModifiedBy || ''
    );
  }, [orderHistory.deltas, orderHistory.first.lastModifiedBy]);

  const totalChanges = deltas.length - orderHistory.sales.length;

  return (
    <div className='flex flex-col px-4'>
      <div className='flex flex-col rounded-md border-1 border-default-400'>
        <Accordion selectionMode='multiple'>
          <AccordionItem
            aria-label='Order History'
            title={
              <TitleComponent
                orderHistory={orderHistory}
                totalChanges={totalChanges}
              />
            }
          >
            <div className='flex w-full flex-col gap-4'>
              <OrderChangeCards
                first={orderHistory.first}
                last={orderHistory.last}
                numberOfSales={orderHistory.sales.length}
              />
              <DeltasList deltas={deltas} message='made to this order' />
            </div>
            <div className='flex flex-col py-4'>
              <SaleHistories saleHistories={orderHistory.sales} />
            </div>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

function TitleComponent({
  orderHistory,
  totalChanges,
}: {
  orderHistory: OrderHistory;
  totalChanges: number;
}) {
  return (
    <div className='flex w-full gap-4'>
      <ShoppingCart size={ICON_MD} />
      <span
        className={
          orderHistory.first.deleted ? `text-danger-500` : `text-foreground`
        }
      >
        {orderHistory.first.name}
      </span>
      <ItemChangeText
        totalChanges={totalChanges}
        created={orderHistory.first.created}
        lastModified={UTCStringtoLocalDate(
          orderHistory.first.lastModified
        ).toLocaleString()}
        lastModifiedBy={orderHistory.first.lastModifiedBy}
      />
    </div>
  );
}

function isFiltered(order: OrderHistory, name: string) {
  const first = order.first.name.toLowerCase();
  const last = order.last?.name.toLowerCase();
  return !(
    first.includes(name.toLowerCase()) || last?.includes(name.toLowerCase())
  );
}
