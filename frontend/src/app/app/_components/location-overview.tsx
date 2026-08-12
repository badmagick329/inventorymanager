import { useAdminStatus } from '@/app/context/global-context-provider';
import { DELAY_500, ICON_MD } from '@/consts';
import { APP_LOCATION_HISTORY } from '@/consts/urls';
import { formatCurrency, formatNumber } from '@/utils';
import { Button, Tooltip } from "@heroui/react";
import { ScrollText } from 'lucide-react';
import Link from 'next/link';

type LocationOverviewProps = {
  spendings?: number;
  revenue?: number;
  profit?: number;
  debt?: number;
  locationId: number;
};

export default function LocationOverview({
  spendings,
  revenue,
  profit,
  debt,
  locationId,
}: LocationOverviewProps) {
  const isAdmin = useAdminStatus();
  if (!isAdmin) {
    return null;
  }
  const missingData =
    spendings === undefined ||
    revenue === undefined ||
    profit === undefined ||
    debt === undefined;
  if (missingData) {
    return null;
  }
  const margin = spendings === 0 ? 0 : (profit / spendings) * 100;
  return (
    <div>
      <div className='grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0'>
        <CurrencyField label='Spent' amount={spendings} />
        <CurrencyField label='Revenue' amount={revenue} />
        <CurrencyField
          label='Profit'
          amount={profit}
          tone={profit >= 0 ? 'positive' : 'negative'}
        />
        <CurrencyField label='Outstanding' amount={debt} tone='warning' />
      </div>
      <div className='flex items-center justify-between border-t border-border px-5 py-3'>
        <div className='text-xs text-muted-foreground'>
          Profit margin{' '}
          <span
            className={`font-semibold tabular-nums ${
              margin >= 0
                ? 'text-success-600 dark:text-success-500'
                : 'text-danger-600 dark:text-danger-500'
            }`}
          >
            {margin.toFixed(1)}%
          </span>
        </div>
        <Tooltip content='View logs' delay={DELAY_500}>
          <Button
            as={Link}
            href={`${APP_LOCATION_HISTORY}/${locationId}`}
            variant='light'
            color='default'
            radius='sm'
            size='sm'
            startContent={<ScrollText size={ICON_MD} />}
          >
            Logs
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

function CurrencyField({
  label,
  amount,
  tone = 'default',
}: {
  label: string;
  amount: number;
  tone?: 'default' | 'positive' | 'negative' | 'warning';
}) {
  const toneClass = {
    default: 'text-foreground',
    positive: 'text-success-600 dark:text-success-500',
    negative: 'text-danger-600 dark:text-danger-500',
    warning: 'text-warning-600 dark:text-warning-500',
  }[tone];

  return (
    <Tooltip content={formatCurrency(amount)}>
      <div className='flex min-w-0 flex-col px-4 py-4'>
        <span className='text-xs text-muted-foreground'>{label}</span>
        <span className={`mt-1 font-semibold tabular-nums ${toneClass}`}>
          Rs {formatNumber(amount)}
        </span>
      </div>
    </Tooltip>
  );
}
