import { useVendors } from '@/hooks';
import { VendorResponse } from '@/types';
import { formatCurrency } from '@/utils';
import { HandCoins } from 'lucide-react';

export default function VendorsInformationCard({
  locationId,
}: {
  locationId?: number;
}) {
  const { data, isLoading, isError } = useVendors(locationId?.toString() || '');
  if (!locationId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className='rounded-lg border border-border bg-card p-5'>
        <span className='text-sm text-muted-foreground'>Loading amounts due…</span>
      </div>
    );
  }

  if (!data || isError) {
    return null;
  }

  const vendorsInDebt = data.filter(
    (vendor: VendorResponse) => vendor.debt > 0
  );

  const totalDebt = vendorsInDebt.reduce(
    (acc: number, vendor: VendorResponse) => acc + vendor.debt,
    0
  );

  if (vendorsInDebt.length === 0) {
    return (
      <div className='rounded-lg border border-border bg-card p-5'>
        <span
          data-testid='items-vendors-card-title'
          className='text-sm font-medium text-success-600 dark:text-success-500'
        >
          All amounts paid in full
        </span>
      </div>
    );
  }

  return (
    <section className='overflow-hidden rounded-lg border border-border bg-card'>
      <div className='flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-2'>
          <HandCoins className='text-warning-600 dark:text-warning-500' size={18} />
          <div>
            <h2
              data-testid='items-vendors-card-title'
              className='font-semibold'
            >
              Amounts due by vendor
            </h2>
            <p className='text-xs text-muted-foreground'>
              Unpaid balances for this location
            </p>
          </div>
        </div>
        <div className='text-sm font-semibold tabular-nums text-warning-600 dark:text-warning-500'>
          Total {formatCurrency(totalDebt)}
        </div>
      </div>
      <div className='grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0'>
        {vendorsInDebt.map((vendor: VendorResponse) => (
          <div
            key={vendor.id}
            className='flex items-center justify-between gap-4 border-b border-border px-5 py-3 sm:odd:border-r'
          >
            <span className='truncate text-sm'>{vendor.name}</span>
            <span className='shrink-0 text-sm font-medium tabular-nums'>
              {formatCurrency(vendor.debt)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
