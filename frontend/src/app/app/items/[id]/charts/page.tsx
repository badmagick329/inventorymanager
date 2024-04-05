'use client';

import { ConnectionError, Spinner } from '@/components';
import { useOrders } from '@/hooks';
import { isOrderResponseArray } from '@/predicates';
import { prepareChartData } from '@/utils/order-cost-chart';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { usePathname } from 'next/navigation';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ChartsPage() {
  const locationId = usePathname().split('/')[3];
  const { error, isError, isLoading, data: orders } = useOrders(locationId);

  if (isLoading) {
    return <Spinner />;
  }

  if (!orders) {
    return null;
  }
  if (!isOrderResponseArray(orders)) {
    return <ConnectionError message='Failed to load orders' />;
  }

  return (
    <div className='flex h-[calc(100dvh-55px)] w-full flex-col items-center gap-4'>
      <span className='pt-6 text-2xl font-semibold tracking-wide'>
        Highest Item Costs
      </span>
      <div className='flex h-4/5 w-full justify-center'>
        <Pie
          data={prepareChartData(orders)}
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
    </div>
  );
}
