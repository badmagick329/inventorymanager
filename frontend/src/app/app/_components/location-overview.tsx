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
  profitPerItem?: number;
  locationId: number;
};

export default function LocationOverview({
  spendings,
  revenue,
  profit,
  locationId,
}: LocationOverviewProps) {
  const isAdmin = useAdminStatus();
  if (!isAdmin) {
    return null;
  }
  const missingData =
    spendings === undefined || revenue === undefined || profit === undefined;
  if (missingData || spendings === 0) {
    return null;
  }
  return (
    <div className='flex gap-4 self-center'>
      <CurrencyField label={'Spending'} amount={spendings} />
      <CurrencyField label={'Revenue'} amount={revenue} />
      <CurrencyField label={'Profit'} amount={profit} />
      <Button
        as={Link}
        href={`${APP_LOCATION_HISTORY}/${locationId}`}
        variant='bordered'
        color='default'
        radius='sm'
        isIconOnly
      >
        <Tooltip content={'Logs'} delay={DELAY_500}>
          <ScrollText size={ICON_MD} />
        </Tooltip>
      </Button>
    </div>
  );
}

function CurrencyField({ label, amount }: { label: string; amount: number }) {
  return (
    <Tooltip content={formatCurrency(amount)}>
      <div className='flex flex-col items-center text-foreground'>
        <span className='text-xs'>{label}</span>
        <span>{formatNumber(amount)}</span>
      </div>
    </Tooltip>
  );
}
