import React from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { Delta, OrderHistory } from '@/types';
import OrderChangeCards from './order-change-cards';
import OrderDeltasList from './order-deltas-list';

export default function OrderHistoryAccordian({
  orderHistory,
}: {
  orderHistory: OrderHistory;
}) {
  orderHistory.deltas = injectDeltasWithUser(
    orderHistory.deltas,
    orderHistory.first.lastModifiedBy || ''
  );
  return (
    <Accordion selectionMode='multiple'>
      <AccordionItem title={`${orderHistory.first.name}`}>
        <div className='flex w-full flex-col gap-4 px-2'>
          <OrderChangeCards
            first={orderHistory.first}
            last={orderHistory.last}
          />
          <OrderDeltasList deltas={orderHistory.deltas} />
        </div>
      </AccordionItem>
    </Accordion>
  );
}

function injectDeltasWithUser(deltas: Delta[], firstUser: string) {
  let lastUser = firstUser;
  return deltas.map((delta) => {
    const changes = delta.changes.map((change) => {
      if (
        change.field === 'lastModifiedBy' &&
        typeof change.newValue === 'string'
      ) {
        lastUser = change.newValue;
      }
      return change;
    });
    return { ...delta, changes, lastModifiedBy: lastUser };
  });
}
