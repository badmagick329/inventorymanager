import { formatNumber } from '@/utils';
import { HandCoins, Landmark, TrendingUp, WalletCards } from 'lucide-react';

export default function LocationInformationCard({
  revenue,
  spendings,
  profit,
  debt,
}: {
  revenue?: number;
  spendings?: number;
  profit?: number;
  debt?: number;
}) {
  if (
    revenue === undefined ||
    spendings === undefined ||
    profit === undefined ||
    debt === undefined
  ) {
    return null;
  }
  const margin = spendings === 0 ? 0 : (profit / spendings) * 100;
  return (
    <div
      data-testid='items-location-card-title'
      className='grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-2 lg:grid-cols-4'
    >
      <SummaryMetric icon={Landmark} label='Total spent' value={spendings} />
      <SummaryMetric icon={WalletCards} label='Revenue' value={revenue} />
      <SummaryMetric
        icon={TrendingUp}
        label='Profit'
        value={profit}
        detail={`${margin.toFixed(1)}% margin`}
        tone={profit >= 0 ? 'positive' : 'negative'}
      />
      <SummaryMetric
        icon={HandCoins}
        label='Outstanding'
        value={debt}
        tone='warning'
      />
    </div>
  );
}

function SummaryMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'default',
}: {
  icon: typeof Landmark;
  label: string;
  value: number;
  detail?: string;
  tone?: 'default' | 'positive' | 'negative' | 'warning';
}) {
  const toneClass = {
    default: 'text-foreground',
    positive: 'text-success-600 dark:text-success-500',
    negative: 'text-danger-600 dark:text-danger-500',
    warning: 'text-warning-600 dark:text-warning-500',
  }[tone];

  return (
    <div className='flex gap-3 border-b border-border px-5 py-4 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0'>
      <Icon className='mt-0.5 shrink-0 text-muted-foreground' size={18} />
      <div className='min-w-0'>
        <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
          {label}
        </p>
        <p className={`mt-1 text-lg font-semibold tabular-nums ${toneClass}`}>
          Rs {formatNumber(value)}
        </p>
        {detail && <p className='text-xs text-muted-foreground'>{detail}</p>}
      </div>
    </div>
  );
}
