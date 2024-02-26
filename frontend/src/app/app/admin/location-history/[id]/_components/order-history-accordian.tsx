import React from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { OrderHistory } from '@/types';
import OrderChangeCards from './order-change-cards';
import DeltasList from './deltas-list';
import SaleHistories from './sale-histories';
import { ShoppingCart } from 'lucide-react';
import { ICON_MD } from '@/consts';
import { injectDeltasWithUser } from '@/utils';

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
  orderHistory.deltas = injectDeltasWithUser(
    orderHistory.deltas,
    orderHistory.first.lastModifiedBy || ''
  );
  let totalChanges = orderHistory.deltas.length;
  totalChanges += orderHistory.sales.reduce(
    (acc, sale) => acc + sale.deltas.length,
    0
  );
  return (
    <div className='flex flex-col px-4'>
      <div className='flex flex-col rounded-md border-1 border-default-400'>
        <Accordion selectionMode='multiple'>
          <AccordionItem
            aria-label='Order History'
            title={
              <div className='flex w-full gap-4'>
                <ShoppingCart size={ICON_MD} />
                <span>{orderHistory.first.name}</span>
                <span className='text-xs text-default-500'>
                  {totalChanges} changes - since {orderHistory.first.created}
                </span>
              </div>
            }
          >
            <div className='flex w-full flex-col gap-4'>
              <OrderChangeCards
                first={orderHistory.first}
                last={orderHistory.last}
                numberOfSales={orderHistory.sales.length}
              />
              <DeltasList
                deltas={orderHistory.deltas}
                message='made to this order'
              />
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

function isFiltered(order: OrderHistory, name: string) {
  const first = order.first.name.toLowerCase();
  const last = order.last?.name.toLowerCase();
  return !(
    first.includes(name.toLowerCase()) || last?.includes(name.toLowerCase())
  );
}
