import { ArrowUpIcon, ArrowDownIcon, Banknote } from 'lucide-react';
import { formatNumber } from '@/utils';
import { useIsAdmin } from '@/hooks';
import { ICON_SM } from '@/consts';

type Props = {
  spendings?: number;
  revenue?: number;
  profit?: number;
  profitPerItem?: number;
};

export default function LocationOverview({
  spendings,
  revenue,
  profit,
}: Props) {
  const { isAdmin, isLoading } = useIsAdmin();
  if (!isAdmin || isLoading) {
    return null;
  }
  const missingData =
    spendings === undefined || revenue === undefined || profit === undefined;
  if (missingData || spendings === 0) {
    return null;
  }
  return (
    <div className='flex gap-4 self-center'>
      <div className='text-danger-500'>
        <ArrowUpIcon size={ICON_SM} />
        <span>{formatNumber(spendings)}</span>
      </div>
      <div className='text-primary-500'>
        <Banknote size={ICON_SM} />
        <span>{formatNumber(revenue)}</span>
      </div>
      <div className='text-success-600'>
        <ArrowDownIcon size={ICON_SM} />
        <span>{formatNumber(profit)}</span>
      </div>
    </div>
  );
}
