import PriceFieldContent from '@/components/price-field-content';
import { HistoricalOrder } from '@/types';
import { UTCStringtoLocalDate } from '@/utils';
import { Card, CardBody, CardHeader, Divider } from '@nextui-org/react';

export default function OrderHistoryCard({
  order,
  numberOfSales,
}: {
  order: HistoricalOrder;
  numberOfSales?: number;
}) {
  return (
    <Card className='min-w-[280px] max-w-[540px] px-2'>
      <CardHeader>
        <div className='flex w-full gap-6'>
          <span>{order.name}</span>
          <div className='flex gap-2 text-xs text-default-500'>
            <span>{order.lastModifiedBy}</span>
            <span>
              {UTCStringtoLocalDate(order.lastModified).toLocaleString()}
            </span>
          </div>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className='flex flex-col gap-2'>
          <FieldWrapper>
            <span className='font-semibold'>Date</span>
            <span>{order.date || '-'}</span>
          </FieldWrapper>
          <FieldWrapper>
            <span className='font-semibold'>Purchase Price</span>
            <PriceFieldContent
              value={order.pricePerItem * order.quantity}
              calculatedValue={order.pricePerItem}
            />
          </FieldWrapper>
          <FieldWrapper>
            <span className='font-semibold'>Quantity</span>
            <span>{order.quantity}</span>
          </FieldWrapper>
          <FieldWrapper>
            <span className='font-semibold'>Sale Price</span>
            <PriceFieldContent
              value={order.currentSalePrice * order.quantity}
              calculatedValue={order.pricePerItem}
            />
          </FieldWrapper>
          <FieldWrapper>
            <span className='font-semibold'>Number of sales</span>
            <span>{numberOfSales || 0}</span>
          </FieldWrapper>
        </div>
      </CardBody>
    </Card>
  );
}

function FieldWrapper({ children }: { children: React.ReactNode }) {
  return <div className='flex w-full justify-between gap-2'>{children}</div>;
}
