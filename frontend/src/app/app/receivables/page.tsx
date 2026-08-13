'use client';

import { ConnectionError, Spinner } from '@/components';
import { APP_ITEMS } from '@/consts/urls';
import { useLocations, useReceivables, useVendorReceivables } from '@/hooks';
import { ReceivablesFilters } from '@/hooks/useReceivables';
import {
  ReceivableSale,
  ReceivableVendor,
  ReceivablesBucket,
  ReceivablesBucketKey,
} from '@/types';
import {
  Button,
  Chip,
  Input,
  Link,
  Select,
  SelectItem,
} from '@heroui/react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  ExternalLink,
  HandCoins,
  Search,
  Users,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Fragment,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

const AGE_OPTIONS: { key: ReceivablesBucketKey | 'all'; label: string }[] = [
  { key: 'all', label: 'All aging bands' },
  { key: '0_30', label: '0–30 days' },
  { key: '31_60', label: '31–60 days' },
  { key: '61_90', label: '61–90 days' },
  { key: '90_plus', label: '90+ days' },
  { key: 'unknown', label: 'Unknown age' },
];

const ORDER_OPTIONS = [
  { key: 'outstanding_desc', label: 'Highest outstanding' },
  { key: 'oldest_desc', label: 'Oldest balance' },
  { key: 'name_asc', label: 'Vendor name' },
  { key: 'outstanding_asc', label: 'Lowest outstanding' },
];

const money = new Intl.NumberFormat('en-PK', {
  maximumFractionDigits: 0,
});

export default function ReceivablesPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ReceivablesDashboard />
    </Suspense>
  );
}

function ReceivablesDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialLocation = searchParams.get('location_id') ?? '';
  const [filters, setFilters] = useState<ReceivablesFilters>({
    locationId: initialLocation,
    query: '',
    ageBucket: '',
    ordering: 'outstanding_desc',
  });
  const [searchValue, setSearchValue] = useState('');
  const { data: locations, isLoading: locationsLoading } = useLocations();
  const { data, isLoading, isFetching, isError } = useReceivables(filters);

  const updateFilters = useCallback(
    (changes: Partial<ReceivablesFilters>) => {
      setFilters((current) => ({ ...current, ...changes }));
    },
    []
  );

  useEffect(() => {
    const timeout = window.setTimeout(
      () => updateFilters({ query: searchValue.trim() }),
      300
    );
    return () => window.clearTimeout(timeout);
  }, [searchValue, updateFilters]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.locationId) params.set('location_id', filters.locationId);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/app/receivables${suffix}`, { scroll: false });
  }, [filters.locationId, router]);

  const locationOptions = useMemo(
    () => [
      { key: 'all', label: 'All permitted locations' },
      ...(locations ?? []).map((location) => ({
        key: String(location.id),
        label: location.name,
      })),
    ],
    [locations]
  );

  if (isLoading && !data) return <Spinner />;
  if (isError || !data) return <ConnectionError message='Unable to load receivables.' />;

  return (
    <section className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10'>
      <header className='mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <HandCoins className='text-primary' size={24} />
            <h1 className='text-3xl font-semibold tracking-tight'>Receivables</h1>
          </div>
          <p className='mt-1 text-sm text-muted-foreground'>
            Current unpaid balances aged from each sale date.
          </p>
        </div>
        <p className='text-xs text-muted-foreground'>
          As of {formatDate(data.asOfDate)} · Pakistan time
        </p>
      </header>

      <SummaryBand data={data.summary} />
      <AgingBand
        buckets={data.buckets}
        total={data.summary.totalOutstanding}
        activeBucket={filters.ageBucket}
        onSelect={(ageBucket) => updateFilters({ ageBucket })}
      />

      <div className='mt-6 grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-2 lg:grid-cols-4'>
        <Input
          label='Search vendors'
          value={searchValue}
          onValueChange={setSearchValue}
          startContent={<Search size={16} className='text-muted-foreground' />}
          isClearable
          onClear={() => setSearchValue('')}
        />
        <Select
          label='Location'
          items={locationOptions}
          selectedKeys={[filters.locationId || 'all']}
          isDisabled={locationsLoading}
          onChange={(event) =>
            updateFilters({
              locationId: event.target.value === 'all' ? '' : event.target.value,
            })
          }
        >
          {(location) => (
            <SelectItem key={location.key}>{location.label}</SelectItem>
          )}
        </Select>
        <Select
          label='Aging band'
          items={AGE_OPTIONS}
          selectedKeys={[filters.ageBucket || 'all']}
          onChange={(event) =>
            updateFilters({
              ageBucket:
                event.target.value === 'all'
                  ? ''
                  : (event.target.value as ReceivablesBucketKey),
            })
          }
        >
          {(option) => <SelectItem key={option.key}>{option.label}</SelectItem>}
        </Select>
        <Select
          label='Sort vendors'
          items={ORDER_OPTIONS}
          selectedKeys={[filters.ordering]}
          onChange={(event) => updateFilters({ ordering: event.target.value })}
        >
          {(option) => <SelectItem key={option.key}>{option.label}</SelectItem>}
        </Select>
      </div>

      <div className='mt-5 flex items-center justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold'>Amounts due by vendor</h2>
          <p className='text-sm text-muted-foreground'>
            {data.vendors.length} {data.vendors.length === 1 ? 'vendor' : 'vendors'}
            {filters.ageBucket
              ? ` with balances in ${bucketLabel(filters.ageBucket)}`
              : ' with an outstanding balance'}
          </p>
        </div>
        {isFetching && <span className='text-xs text-muted-foreground'>Updating…</span>}
      </div>

      {data.vendors.length === 0 ? (
        <div className='mt-4 flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 text-center'>
          <CircleDollarSign className='mb-3 text-muted-foreground' size={28} />
          <p className='font-medium'>No outstanding balances found</p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Try another location, aging band, or vendor search.
          </p>
        </div>
      ) : (
        <VendorTable vendors={data.vendors} ageBucket={filters.ageBucket} />
      )}
    </section>
  );
}

function SummaryBand({
  data,
}: {
  data: {
    totalOutstanding: number;
    openSaleCount: number;
    vendorCount: number;
    oldestAgeDays: number | null;
    unknownDateCount: number;
  };
}) {
  const metrics = [
    {
      label: 'Total outstanding',
      value: currency(data.totalOutstanding),
      icon: HandCoins,
      tone: 'text-warning-600 dark:text-warning-500',
    },
    { label: 'Unpaid sales', value: String(data.openSaleCount), icon: CircleDollarSign },
    { label: 'Vendors owing', value: String(data.vendorCount), icon: Users },
    {
      label: 'Oldest known balance',
      value:
        data.oldestAgeDays === null ? 'No dated balances' : `${data.oldestAgeDays} days`,
      icon: AlertTriangle,
      tone: data.oldestAgeDays && data.oldestAgeDays > 90
        ? 'text-danger-600 dark:text-danger-500'
        : '',
    },
  ];
  return (
    <div className='grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-2 lg:grid-cols-4'>
      {metrics.map(({ label, value, icon: Icon, tone }) => (
        <div
          key={label}
          className='flex gap-3 border-b border-border px-5 py-4 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0'
        >
          <Icon className='mt-0.5 shrink-0 text-muted-foreground' size={18} />
          <div>
            <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              {label}
            </p>
            <p className={`mt-1 text-lg font-semibold tabular-nums ${tone ?? ''}`}>
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AgingBand({
  buckets,
  total,
  activeBucket,
  onSelect,
}: {
  buckets: ReceivablesBucket[];
  total: number;
  activeBucket: ReceivablesBucketKey | '';
  onSelect: (value: ReceivablesBucketKey | '') => void;
}) {
  return (
    <section className='mt-5 overflow-hidden rounded-lg border border-border bg-card'>
      <div className='border-b border-border px-5 py-3'>
        <h2 className='text-sm font-semibold'>Aging distribution</h2>
        <p className='text-xs text-muted-foreground'>
          Select a band to focus the vendor list. Missing and future dates are unknown.
        </p>
      </div>
      <div className='grid sm:grid-cols-2 lg:grid-cols-5'>
        {buckets.map((bucket) => {
          const selected = activeBucket === bucket.key;
          const percentage = total === 0 ? 0 : (bucket.amount / total) * 100;
          return (
            <button
              key={bucket.key}
              type='button'
              aria-pressed={selected}
              onClick={() => onSelect(selected ? '' : bucket.key)}
              className={`border-b border-border px-5 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset lg:border-b-0 lg:border-r lg:last:border-r-0 ${
                selected ? 'bg-primary/10' : ''
              }`}
            >
              <div className='flex items-center justify-between gap-3'>
                <span className='text-sm font-medium'>{bucket.label}</span>
                <span className='text-xs tabular-nums text-muted-foreground'>
                  {percentage.toFixed(0)}%
                </span>
              </div>
              <p className={`mt-2 font-semibold tabular-nums ${bucketTone(bucket.key)}`}>
                {currency(bucket.amount)}
              </p>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                {bucket.saleCount} {bucket.saleCount === 1 ? 'sale' : 'sales'}
              </p>
              <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-muted'>
                <div
                  className={`h-full ${bucketBarTone(bucket.key)}`}
                  style={{ width: `${Math.max(percentage, bucket.amount ? 3 : 0)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function VendorTable({
  vendors,
  ageBucket,
}: {
  vendors: ReceivableVendor[];
  ageBucket: ReceivablesBucketKey | '';
}) {
  const [openVendorId, setOpenVendorId] = useState<number | null>(null);
  return (
    <div className='mt-4 overflow-x-auto rounded-lg border border-border bg-card'>
      <table className='w-full min-w-[820px] border-collapse text-sm'>
        <thead className='bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground'>
          <tr>
            <th className='px-4 py-3 font-medium'>Vendor</th>
            <th className='px-4 py-3 font-medium'>Location</th>
            <th className='px-4 py-3 text-right font-medium'>Outstanding</th>
            <th className='px-4 py-3 text-right font-medium'>Unpaid sales</th>
            <th className='px-4 py-3 text-right font-medium'>Oldest age</th>
            <th className='w-36 px-4 py-3 font-medium'>Details</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => {
            const isOpen = openVendorId === vendor.vendorId;
            return (
              <Fragment key={vendor.vendorId}>
                <tr className='border-t border-border'>
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>{vendor.name}</span>
                      {vendor.isArchived && (
                        <Chip size='sm' variant='flat' color='default'>Archived</Chip>
                      )}
                    </div>
                  </td>
                  <td className='px-4 py-3 text-muted-foreground'>
                    {vendor.locationName}
                  </td>
                  <td className='px-4 py-3 text-right font-semibold tabular-nums text-warning-600 dark:text-warning-500'>
                    {currency(vendor.totalOutstanding)}
                  </td>
                  <td className='px-4 py-3 text-right tabular-nums'>
                    {vendor.openSaleCount}
                  </td>
                  <td className='px-4 py-3 text-right tabular-nums'>
                    {vendor.oldestAgeDays === null
                      ? 'Unknown'
                      : `${vendor.oldestAgeDays} days`}
                  </td>
                  <td className='px-4 py-3'>
                    <Button
                      size='sm'
                      variant='light'
                      color='default'
                      onPress={() => setOpenVendorId(isOpen ? null : vendor.vendorId)}
                      endContent={isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    >
                      {isOpen ? 'Hide' : 'View sales'}
                    </Button>
                  </td>
                </tr>
                {isOpen && (
                  <tr className='border-t border-border bg-muted/20'>
                    <td colSpan={6} className='p-0'>
                      <VendorSales vendor={vendor} ageBucket={ageBucket} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function VendorSales({
  vendor,
  ageBucket,
}: {
  vendor: ReceivableVendor;
  ageBucket: ReceivablesBucketKey | '';
}) {
  const { data, isLoading, isError } = useVendorReceivables(
    vendor.vendorId,
    ageBucket,
    true
  );
  if (isLoading) {
    return <p className='px-5 py-6 text-sm text-muted-foreground'>Loading unpaid sales…</p>;
  }
  if (isError || !data) {
    return <p className='px-5 py-6 text-sm text-danger'>Unable to load unpaid sales.</p>;
  }
  if (data.results.length === 0) {
    return <p className='px-5 py-6 text-sm text-muted-foreground'>No sales in this aging band.</p>;
  }
  return (
    <div className='px-4 py-4'>
      <div className='mb-3 flex items-center justify-between gap-3'>
        <p className='font-medium'>Unpaid sales for {vendor.name}</p>
        <span className='text-xs text-muted-foreground'>
          {data.results.length} {data.results.length === 1 ? 'balance' : 'balances'}
        </span>
      </div>
      <table className='w-full border-collapse text-sm'>
        <thead className='text-left text-xs text-muted-foreground'>
          <tr>
            <th className='pb-2 font-medium'>Item</th>
            <th className='pb-2 font-medium'>Sale date</th>
            <th className='pb-2 text-right font-medium'>Age</th>
            <th className='pb-2 text-right font-medium'>Quantity</th>
            <th className='pb-2 text-right font-medium'>Sale total</th>
            <th className='pb-2 text-right font-medium'>Paid</th>
            <th className='pb-2 text-right font-medium'>Outstanding</th>
            <th className='pb-2 pl-4 font-medium'>Record</th>
          </tr>
        </thead>
        <tbody>
          {data.results.map((sale) => (
            <SaleRow key={sale.saleId} sale={sale} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SaleRow({ sale }: { sale: ReceivableSale }) {
  return (
    <tr className='border-t border-border'>
      <td className='py-3 pr-4 font-medium'>{sale.orderName}</td>
      <td className='py-3 pr-4 text-muted-foreground'>
        {sale.saleDate ? formatDate(sale.saleDate) : 'Not recorded'}
      </td>
      <td className='py-3 text-right tabular-nums'>
        {sale.ageDays === null ? 'Unknown' : `${sale.ageDays} days`}
      </td>
      <td className='py-3 text-right tabular-nums'>{sale.quantity}</td>
      <td className='py-3 text-right tabular-nums'>{currency(sale.totalSaleValue)}</td>
      <td className='py-3 text-right tabular-nums'>{currency(sale.amountPaid)}</td>
      <td className='py-3 text-right font-semibold tabular-nums text-warning-600 dark:text-warning-500'>
        {currency(sale.outstandingAmount)}
      </td>
      <td className='py-3 pl-4'>
        {sale.isOrderArchived ? (
          <Chip size='sm' variant='flat' color='default'>Archived item</Chip>
        ) : (
          <Button
            as={Link}
            href={`${APP_ITEMS}/${sale.locationId}/${sale.orderId}`}
            size='sm'
            variant='light'
            color='primary'
            endContent={<ExternalLink size={14} />}
          >
            Open
          </Button>
        )}
      </td>
    </tr>
  );
}

function currency(value: number) {
  return `Rs ${money.format(value)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

function bucketLabel(key: ReceivablesBucketKey) {
  return AGE_OPTIONS.find((option) => option.key === key)?.label ?? key;
}

function bucketTone(key: ReceivablesBucketKey) {
  if (key === '90_plus') return 'text-danger-600 dark:text-danger-500';
  if (key === '61_90') return 'text-warning-600 dark:text-warning-500';
  return 'text-foreground';
}

function bucketBarTone(key: ReceivablesBucketKey) {
  if (key === '90_plus') return 'bg-danger-500';
  if (key === '61_90') return 'bg-warning-500';
  if (key === 'unknown') return 'bg-default-400';
  return 'bg-primary';
}
