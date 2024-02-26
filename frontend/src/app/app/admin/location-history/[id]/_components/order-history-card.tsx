import { HistoricalOrder } from '@/types';
import { Card, CardHeader, CardBody, Divider } from '@nextui-org/react';
import PriceFieldContent from '@/components/price-field-content';
export default function OrderHistoryCard({
  order,
}: {
  order: HistoricalOrder;
}) {
  return (
    <Card className='min-w-[280px] max-w-[540px] px-2'>
      <CardHeader>
        <div className='flex w-full gap-6'>
          <span>{order.name}</span>
          <div className='flex gap-2 text-xs text-default-500'>
            <span>{order.lastModifiedBy}</span>
            <span>{order.lastModified}</span>
          </div>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className='flex flex-col gap-2'>
          <div className='flex w-full justify-between gap-2'>
            <span className='font-semibold'>Date</span>
            <span>{order.date || '-'}</span>
          </div>
          <div className='flex w-full justify-between gap-2'>
            <span className='font-semibold'>Purchase Price</span>
            <PriceFieldContent
              value={order.pricePerItem * order.quantity}
              calculatedValue={order.pricePerItem}
            />
          </div>
          <div className='flex w-full justify-between gap-2'>
            <span className='font-semibold'>Quantity</span>
            <span>{order.quantity}</span>
          </div>
          <div className='flex w-full justify-between gap-2'>
            <span className='font-semibold'>Sale Price</span>
            <PriceFieldContent
              value={order.currentSalePrice * order.quantity}
              calculatedValue={order.pricePerItem}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
