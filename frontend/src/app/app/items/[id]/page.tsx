'use client';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/loaders';
import { useLocations, useOrders } from '@/hooks';
import { APP_LOGIN, APP_LOCATIONS } from '@/consts/urls';
import { usePathname } from 'next/navigation';
import { isOrderResponseArray } from '@/predicates';
import { ConnectionError } from '@/components/errors';
import { Spacer, Button, Link } from '@nextui-org/react';
import CreateOrderModal from './_componenets/create-order-modal';
import { useDeleteOrder } from '@/hooks';
import OptionalErrorElement from './_componenets/optional-error-element';
import OrdersTable from './_componenets/orders-table';
import LocationInformation from './_componenets/location-information';
import { useState } from 'react';
import { Location } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { preFetchVendors } from '@/utils/requests';

export default function Orders() {
  const locationId = usePathname().split('/')[3];
  const router = useRouter();
  const { error, isError, isLoading, data } = useOrders(locationId);
  const { data: locations } = useLocations();
  const [detailsHidden, setDetailsHidden] = useState(true);
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
  preFetchVendors(queryClient, locationId);

  return (
    <div className='flex w-full flex-col justify-center p-4'>
      <Spacer y={2} />
      <span className='text-2xl font-semibold text-center'>
        {location?.name}
      </span>
      <Spacer y={2} />
      <div className='flex justify-center gap-4'>
        <LocationInformation
          detailsHidden={detailsHidden}
          orders={orders}
          location={location}
        />
      </div>
      <Spacer y={4} />
      <div className='flex justify-center gap-4'>
        <CreateOrderModal locationId={locationId} />
        <Button
          as={Link}
          href={APP_LOCATIONS}
          variant='flat'
          size='md'
          color='default'
        >
          Back to Locations
        </Button>
        <Button
          variant='flat'
          size='md'
          color='default'
          onPress={() => setDetailsHidden(!detailsHidden)}
        >
          {detailsHidden ? 'Show More' : 'Hide'}
        </Button>
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
