'use client';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/loaders';
import { useOrders } from '@/hooks';
import { APP_LOGIN, APP_LOCATIONS } from '@/consts/urls';
import { usePathname } from 'next/navigation';
import { isOrderResponseArray } from '@/predicates';
import { ConnectionError } from '@/components/errors';
import { Spacer, Button, Link } from '@nextui-org/react';
import CreateOrderModal from './_componenets/create-order-modal';
import { useDeleteOrder } from '@/hooks';
import OptionalErrorElement from './_componenets/optional-error-element';
import OrdersTable from './_componenets/orders-table';

export default function Orders() {
  const locationId = usePathname().split('/')[3];
  const router = useRouter();
  const { error, isError, isLoading, data } = useOrders(locationId);
  const deleteOrder = useDeleteOrder();
  if (isError) {
    const comp = <OptionalErrorElement errorMessage={error.message} />;
    if (comp) {
      return comp;
    } else {
      router.push(APP_LOGIN);
    }
  }

  const orders = data;
  if (isLoading || !orders) {
    return <Spinner />;
  }
  if (!isOrderResponseArray(orders)) {
    return <ConnectionError message='Failed to load orders' />;
  }

  return (
    <div className='flex w-full flex-col justify-center p-4'>
      <Spacer y={2} />
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
