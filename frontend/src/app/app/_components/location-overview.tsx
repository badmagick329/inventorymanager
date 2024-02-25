import { ArrowUpIcon, ArrowDownIcon, Banknote } from 'lucide-react';
import { formatNumber } from '@/utils';
import { useAdminStatus } from '@/app/context/adminProvider';
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
  const isAdmin = useAdminStatus();
  if (!isAdmin) {
    return null;
  }
  const missingData =
    spendings === undefined || revenue === undefined || profit === undefined;
  if (missingData || spendings === 0) {
    return null;
  }
  const profitColor = profit < 0 ? 'text-danger-500' : 'text-success-600';
  return (
    <div className='flex gap-4 self-center'>
      <div className='text-foreground'>
        <ArrowUpIcon size={ICON_SM} />
        <span>{formatNumber(spendings)}</span>
      </div>
      <div className='text-foreground'>
        <ArrowDownIcon size={ICON_SM} />
        <span>{formatNumber(revenue)}</span>
      </div>
      <div className={profitColor}>
        <Banknote size={ICON_SM} />
        <span>{formatNumber(profit)}</span>
      </div>
    </div>
  );
}
