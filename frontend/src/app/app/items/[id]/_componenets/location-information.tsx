import { Location, OrderResponse } from '@/types';
import { formatCurrency } from '@/utils';

export default function LocationInformation({
  detailsHidden,
  orders,
  location,
}: {
  detailsHidden: boolean;
  orders: OrderResponse[];
  location?: Location;
}) {
  if (detailsHidden) {
    return null;
  }
  const totalDebt = orders.reduce((acc, order) => {
    return acc + order.debt;
  }, 0);
  return (
    <div className='flex w-full max-w-lg flex-col items-center divide-y-2 rounded-md bg-neutral-100 p-4 text-center dark:divide-neutral-400 dark:bg-neutral-800'>
      <CurrencyDisplay text='Total revenue' value={location?.revenue} />
      <CurrencyDisplay text='Total spent' value={location?.spendings} />
      <CurrencyDisplay text='Total profit' value={location?.profit} />
      <CurrencyDisplay text='Total due' value={totalDebt} />
    </div>
  );
}

function CurrencyDisplay({ text, value }: { text: string; value?: number }) {
  if (value === undefined) {
    return null;
  }
  return (
    <div className='flex w-full justify-between py-2'>
      <span>{text}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
