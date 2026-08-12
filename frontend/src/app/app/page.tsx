'use client';

import { useAdminStatus } from '@/app/context/global-context-provider';
import { Spinner } from '@/components';
import { APP_LOGIN } from '@/consts/urls';
import { useLocations } from '@/hooks';
import { Location } from '@/types';
import { formatNumber } from '@/utils';
import { Chip } from '@heroui/react';
import { Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import LocationLink from './_components/location-link';
import LocationOverview from './_components/location-overview';

export default function Locations() {
  const router = useRouter();
  const { error, isError, isLoading, data: locations } = useLocations();
  const isAdmin = useAdminStatus();
  const nonAdminMessage = isAdmin
    ? ''
    : 'You may not have permission to view any locations yet.';

  if (isError) {
    console.error(`Received error ${error}`);
    router.push(APP_LOGIN);
  }

  if (isLoading) {
    return <Spinner />;
  }
  if (locations) {
    const financialLocations = locations.filter(
      (location) =>
        location.spendings !== undefined &&
        location.revenue !== undefined &&
        location.profit !== undefined &&
        location.debt !== undefined
    );
    const totals = financialLocations.reduce(
      (summary, location) => ({
        spendings: summary.spendings + (location.spendings ?? 0),
        revenue: summary.revenue + (location.revenue ?? 0),
        profit: summary.profit + (location.profit ?? 0),
        debt: summary.debt + (location.debt ?? 0),
      }),
      { spendings: 0, revenue: 0, profit: 0, debt: 0 }
    );

    return (
      <section className='mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12'>
        <header className='mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h1
              data-testid='home-locations-title'
              className='text-3xl font-semibold tracking-tight'
            >
              Locations
            </h1>
            <p className='mt-1 max-w-2xl text-sm text-muted-foreground'>
              Open a school inventory or review its financial position.
            </p>
          </div>
          <Chip variant='flat' color='default' radius='sm'>
            {locations.length} {locations.length === 1 ? 'location' : 'locations'}
          </Chip>
        </header>

        {isAdmin && financialLocations.length > 0 && (
          <div className='mb-8 grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-2 lg:grid-cols-4'>
            <PortfolioMetric label='Total spent' value={totals.spendings} />
            <PortfolioMetric label='Revenue' value={totals.revenue} />
            <PortfolioMetric
              label='Profit'
              value={totals.profit}
              tone={totals.profit >= 0 ? 'positive' : 'negative'}
            />
            <PortfolioMetric
              label='Outstanding'
              value={totals.debt}
              tone='warning'
            />
          </div>
        )}

        <div className='grid gap-4 lg:grid-cols-2'>
          {locations.map((loc: Location) => (
            <article
              data-testid='home-locations-container'
              key={loc.name}
              className='overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40'
            >
              <div className='flex items-center justify-between gap-4 border-b border-border px-5 py-4'>
                <div className='flex min-w-0 items-center gap-3'>
                  <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary'>
                    <Building2 size={20} />
                  </span>
                  <div className='min-w-0'>
                    <LocationLink id={loc.id} name={loc.name} />
                    {isAdmin && (
                      <p className='text-xs text-muted-foreground'>
                        {loc.users?.length ?? 0} assigned{' '}
                        {(loc.users?.length ?? 0) === 1 ? 'user' : 'users'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <LocationOverview
                spendings={loc.spendings}
                revenue={loc.revenue}
                profit={loc.profit}
                debt={loc.debt}
                locationId={loc.id}
              />
            </article>
          ))}
        </div>

        {locations.length === 0 && (
          <div
            data-testid='home-locations-container'
            className='flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 text-center text-muted-foreground'
          >
            No locations found. {nonAdminMessage}
          </div>
        )}
      </section>
    );
  }
}

function PortfolioMetric({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'positive' | 'negative' | 'warning';
}) {
  const toneClass = {
    default: 'text-foreground',
    positive: 'text-success-600 dark:text-success-500',
    negative: 'text-danger-600 dark:text-danger-500',
    warning: 'text-warning-600 dark:text-warning-500',
  }[tone];

  return (
    <div className='border-b border-border px-5 py-4 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0'>
      <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
        {label}
      </p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${toneClass}`}>
        Rs {formatNumber(value)}
      </p>
    </div>
  );
}
