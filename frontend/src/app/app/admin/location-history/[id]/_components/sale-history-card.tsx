import { HistoricalSale } from '@/types';
import { Card, CardHeader, CardBody, Divider } from '@nextui-org/react';
import PriceFieldContent from '@/components/price-field-content';
export default function SaleHistoryCard({ sale }: { sale: HistoricalSale }) {
  return (
    <Card className='min-w-[280px] max-w-[540px] px-2'>
      <CardHeader>
        <div className='flex w-full justify-between gap-6'>
          <span>Sale to {sale.vendor}</span>
          <div className='flex gap-2 text-xs text-default-500'>
            <span>{sale.lastModifiedBy}</span>
            <span>{sale.lastModified}</span>
          </div>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className='flex flex-col gap-2'>
          <div className='flex w-full justify-between gap-2'>
            <span className='font-semibold'>Date</span>
            <span>{sale.date || '-'}</span>
          </div>
          <div className='flex w-full justify-between gap-2'>
            <span className='font-semibold'>Sale Price</span>
            <PriceFieldContent
              value={sale.pricePerItem * sale.quantity}
              calculatedValue={sale.pricePerItem}
            />
          </div>
          <div className='flex w-full justify-between gap-2'>
            <span className='font-semibold'>Quantity</span>
            <span>{sale.quantity}</span>
          </div>
          <div className='flex w-full justify-between gap-2'>
            <span className='font-semibold'>Amount Paid</span>
            <PriceFieldContent value={sale.amountPaid} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
