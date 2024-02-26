import React from 'react';
import { Accordion, AccordionItem, Divider } from '@nextui-org/react';
import { Delta, OrderHistory } from '@/types';
import { MoveRight } from 'lucide-react';
import { ICON_MD } from '@/consts';
import HistoricalOrderCard from './order-history-card';

const fieldMap = new Map([
  ['name', 'Name'],
  ['pricePerItem', 'Price Per Item'],
  ['currentSalePrice', 'Sale Price'],
]);

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
        <ul className='flex w-full flex-col gap-4'>
          <div className='flex w-full flex-wrap gap-2'>
            {orderHistory.last && (
              <div className='flex items-center gap-2'>
                <div className='flex flex-col items-center gap-2'>
                  <span>Oldest</span>
                  <HistoricalOrderCard order={orderHistory.last} />
                </div>
                <MoveRight size={ICON_MD} />
              </div>
            )}
            <div className='flex flex-col items-center gap-2'>
              <span>Latest</span>
              <HistoricalOrderCard order={orderHistory.first} />
            </div>
            <div className='py-2'>
              <Divider />
            </div>
          </div>
          {orderHistory.deltas.map((delta, index) => {
            if (delta.changes.length === 0) return null;
            return (
              <li key={index} className='flex flex-col'>
                <ul>
                  {delta.changes.map((change, index) => {
                    if (change.field === 'lastModifiedBy') {
                      return null;
                    }
                    return (
                      <li className='pl-4' key={index}>
                        <div className='flex gap-2'>
                          <span className='font-semibold'>
                            {fieldMap.get(change.field) ||
                              change.field.slice(0, 1).toUpperCase() +
                                change.field.slice(1)}
                          </span>
                          <span> </span>
                          <span className='text-danger-500'>
                            {change.oldValue || '-'}
                          </span>{' '}
                          <MoveRight size={ICON_MD} />
                          <span className='text-success-500'>
                            {change.newValue || '-'}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                  {delta.changes.length > 0 && (
                    <li className='pl-4'>
                      {delta.lastModifiedBy} - {delta.lastModified}
                    </li>
                  )}
                </ul>
                <div className='py-2'>
                  <Divider />
                </div>
              </li>
            );
          })}
        </ul>
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
