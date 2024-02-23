import { VendorResponse } from '@/types';
import CurrencyDisplay from './currency-display';
import { useVendors } from '@/hooks';

export default function VendorsInformationCard({
  locationId,
}: {
  locationId?: number;
}) {
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
        <CurrencyDisplay
          key={vendor.id}
          text={vendor.name}
          value={vendor.debt}
        />
      ))}
    </div>
  );
}
