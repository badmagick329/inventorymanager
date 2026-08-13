import { APP_RECEIVABLES } from '@/consts/urls';
import { VendorResponse } from '@/types';
import { Button, Link } from '@heroui/react';
import { CheckCircle2, HandCoins } from 'lucide-react';

export default function VendorsCard({
  vendors,
  locationId,
}: {
  vendors: VendorResponse[];
  locationId: string;
}) {
  const vendorsInDebt = vendors.filter((vendor) => vendor.debt > 0);
  const totalDebt = vendorsInDebt.reduce(
    (total, vendor) => total + vendor.debt,
    0
  );

  if (vendors.length === 0) {
    return null;
  }

  if (vendorsInDebt.length === 0) {
    return (
      <section className='flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-success-600 dark:text-success-500'>
        <CheckCircle2 size={18} />
        <span data-testid='sales-vendors-card-title' className='font-medium'>
          All recorded sales for this item are fully paid
        </span>
      </section>
    );
  }

  return (
    <section className='overflow-hidden rounded-lg border border-border bg-card'>
      <div className='flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-2'>
          <HandCoins
            className='text-warning-600 dark:text-warning-500'
            size={18}
          />
          <div>
            <h2
              data-testid='sales-vendors-card-title'
              className='text-sm font-semibold'
            >
              Outstanding for this item
            </h2>
            <p className='text-xs text-muted-foreground'>
              {vendorsInDebt.length}{' '}
              {vendorsInDebt.length === 1 ? 'vendor owes' : 'vendors owe'}{' '}
              <span className='font-semibold tabular-nums text-warning-600 dark:text-warning-500'>
                {money(totalDebt)}
              </span>
            </p>
          </div>
        </div>
        <Button
          as={Link}
          href={`${APP_RECEIVABLES}?location_id=${locationId}`}
          size='sm'
          radius='sm'
          variant='light'
          color='default'
        >
          View receivables
        </Button>
      </div>
      <div className='grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3'>
        {vendorsInDebt.map((vendor) => (
          <div
            key={vendor.id}
            className='flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:odd:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0'
          >
            <span className='truncate text-sm'>{vendor.name}</span>
            <span className='shrink-0 text-sm font-semibold tabular-nums text-warning-600 dark:text-warning-500'>
              {money(vendor.debt)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function money(value: number) {
  return `Rs ${new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(value)}`;
}
