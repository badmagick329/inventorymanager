'use client';

import { ConnectionError, OptionalErrorElement, Spinner } from '@/components';
import { ICON_SM } from '@/consts';
import { APP_LOGIN, APP_MANAGE_VENDORS } from '@/consts/urls';
import {
  useDeleteOrder,
  useLocalStorage,
  useLocations,
  useOrders,
} from '@/hooks';
import { isOrderResponseArray } from '@/predicates';
import { Location } from '@/types';
import { preFetchVendors as preFetchAdditionalVendorDetails } from '@/utils/requests';
import { Button, Link, Spacer } from '@nextui-org/react';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import { CreateOrderModal, MoreInformation, OrdersTable } from './_components';

export default function Orders() {
  const locationId = usePathname().split('/')[3];
  const router = useRouter();
  const { error, isError, isLoading, data } = useOrders(locationId);
  const { data: locations } = useLocations();
  const [detailsHidden, setDetailsHidden] = useLocalStorage(
    'items/detailsHidden',
    true
  );
  const deleteOrder = useDeleteOrder();
  const queryClient = useQueryClient();

  if (isError) {
    const comp = <OptionalErrorElement errorMessage={error.message} />;
    if (comp) {
      return comp;
    } else {
      router.push(APP_LOGIN);
    }
  }

  const orders = data;
  const location = locations?.find(
    (loc: Location) => loc.id.toString() === locationId
  );
  if (isLoading || !orders) {
    return <Spinner />;
  }
  if (!isOrderResponseArray(orders)) {
    return <ConnectionError message='Failed to load orders' />;
  }
  preFetchAdditionalVendorDetails(queryClient, locationId);

  return (
    <div className='flex w-full flex-col justify-center p-4'>
      <Spacer y={2} />
      <span className='text-center text-2xl font-semibold'>
        {location?.name}
      </span>
      <Spacer y={2} />
      <div className='flex justify-center gap-4'>
        <MoreInformation detailsHidden={detailsHidden} location={location} />
      </div>
      <Spacer y={4} />
      <div className='flex justify-center gap-8'>
        <Button
          as={Link}
          href={`${APP_MANAGE_VENDORS}/${locationId}`}
          variant='flat'
          color='default'
          radius='sm'
          showAnchorIcon
        >
          Manage Vendors
        </Button>
        <div className='flex gap-2'>
          <Button
            variant='ghost'
            color='default'
            radius='sm'
            onPress={() => setDetailsHidden(!detailsHidden)}
            endContent={
              detailsHidden ? (
                <ChevronDown size={ICON_SM} />
              ) : (
                <ChevronUp size={ICON_SM} />
              )
            }
          >
            {detailsHidden ? 'Show More' : 'Hide'}
          </Button>
          <CreateOrderModal locationId={locationId} />
        </div>
      </div>
      <Spacer y={4} />
      <OrdersTable
        locationId={locationId}
        orders={orders}
        deleteOrder={deleteOrder}
      />
    </div>
  );
}
