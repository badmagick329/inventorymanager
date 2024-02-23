import { Location, OrderResponse, VendorResponse } from '@/types';
import { formatCurrency } from '@/utils';
import { useVendors } from '@/hooks';

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
    <div className='flex w-full justify-center gap-4 flex-wrap'>
      <div className='flex w-full max-w-lg flex-col items-center divide-y-2 rounded-md bg-neutral-100 p-4 text-center dark:divide-neutral-400 dark:bg-neutral-800'>
        <CurrencyDisplay text='Total revenue' value={location?.revenue} />
        <CurrencyDisplay text='Total spent' value={location?.spendings} />
        <CurrencyDisplay text='Total profit' value={location?.profit} />
        <CurrencyDisplay text='Total due' value={totalDebt} />
      </div>
      <VendorsInformation locationId={location?.id} />
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

function VendorsInformation({ locationId }: { locationId?: number }) {
  if (!locationId) {
    return null;
  }
  const { data, isLoading, isError } = useVendors(locationId.toString());
  if (isLoading) {
    return (
      <div className='flex w-[32rem] flex-col items-center justify-center divide-y-2 rounded-md bg-neutral-100 p-4 text-center dark:divide-neutral-400 dark:bg-neutral-800'>
        <span className='text-xl'>Loading...</span>
      </div>
    );
  }
  if (!data || isError) {
    return null;
  }
  const vendorsInDebt = data.filter(
    (vendor: VendorResponse) => vendor.debt > 0
  );
  if (vendorsInDebt.length === 0) {
    return (
      <div className='flex w-full max-w-lg flex-col items-center divide-y-2 rounded-md bg-neutral-100 p-4 text-center dark:divide-neutral-400 dark:bg-neutral-800'>
        <span className='text-xl'>All amounts paid in full</span>
      </div>
    );
  }
  return (
    <div className='flex w-full max-w-lg flex-col items-center divide-y-2 rounded-md bg-neutral-100 p-4 text-center dark:divide-neutral-400 dark:bg-neutral-800'>
      {vendorsInDebt.map((vendor: VendorResponse) => (
        <div key={vendor.id} className='flex w-full justify-between py-2'>
          <span>{vendor.name}</span>
          <span>{formatCurrency(vendor.debt)}</span>
        </div>
      ))}
    </div>
  );
}
