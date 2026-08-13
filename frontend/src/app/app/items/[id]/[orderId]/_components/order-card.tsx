import {
  BadgeDollarSign,
  Boxes,
  CircleDollarSign,
  HandCoins,
  TrendingUp,
  WalletCards,
} from 'lucide-react';

type OrderCardProps = {
  pricePerItem: number;
  quantity: number;
  soldQuantity: number;
  currentSalePrice: number;
  profit: number;
  debt: number;
  amountPaid: number;
  salesCount: number;
};

export default function OrderCard({
  pricePerItem,
  quantity,
  soldQuantity,
  currentSalePrice,
  profit,
  debt,
  amountPaid,
  salesCount,
}: OrderCardProps) {
  const remainingStock = quantity - soldQuantity;
  const salesValue = amountPaid + debt;
  const unitMargin = currentSalePrice - pricePerItem;
  const profitMargin = salesValue === 0 ? 0 : (profit / salesValue) * 100;

  return (
    <section
      data-testid='sales-order-summary'
      aria-label='Item summary'
      className='grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
    >
      <SummaryMetric
        icon={Boxes}
        label='Stock remaining'
        value={remainingStock.toLocaleString('en-PK')}
        detail={`${soldQuantity.toLocaleString('en-PK')} of ${quantity.toLocaleString('en-PK')} sold`}
      />
      <SummaryMetric
        icon={CircleDollarSign}
        label='Unit cost'
        value={money(pricePerItem)}
        detail={`${money(pricePerItem * quantity)} total cost`}
      />
      <SummaryMetric
        icon={BadgeDollarSign}
        label='Current sale price'
        value={money(currentSalePrice)}
        detail={`${money(unitMargin)} unit margin`}
      />
      <SummaryMetric
        icon={WalletCards}
        label='Sales value'
        value={money(salesValue)}
        detail={`${salesCount.toLocaleString('en-PK')} ${salesCount === 1 ? 'sale' : 'sales'} recorded`}
      />
      <SummaryMetric
        icon={TrendingUp}
        label='Profit'
        value={money(profit)}
        detail={`${profitMargin.toFixed(1)}% margin`}
        tone={profit >= 0 ? 'positive' : 'negative'}
      />
      <SummaryMetric
        icon={HandCoins}
        label='Outstanding'
        value={money(debt)}
        detail={`${money(amountPaid)} collected`}
        tone={debt > 0 ? 'warning' : 'positive'}
      />
    </section>
  );
}

function SummaryMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'default',
}: {
  icon: typeof Boxes;
  label: string;
  value: string;
  detail: string;
  tone?: 'default' | 'positive' | 'negative' | 'warning';
}) {
  const toneClass = {
    default: 'text-foreground',
    positive: 'text-success-600 dark:text-success-500',
    negative: 'text-danger-600 dark:text-danger-500',
    warning: 'text-warning-600 dark:text-warning-500',
  }[tone];

  return (
    <div className='flex min-w-0 gap-3 border-b border-border px-4 py-4 sm:border-r sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0 xl:border-b-0 xl:[&:nth-child(3n)]:border-r xl:last:border-r-0'>
      <Icon className='mt-0.5 shrink-0 text-muted-foreground' size={18} />
      <div className='min-w-0'>
        <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
          {label}
        </p>
        <p className={`mt-1 truncate text-lg font-semibold tabular-nums ${toneClass}`}>
          {value}
        </p>
        <p className='truncate text-xs text-muted-foreground'>{detail}</p>
      </div>
    </div>
  );
}

function money(value: number) {
  return `Rs ${new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(value)}`;
}
