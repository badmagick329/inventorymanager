'use client';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/loaders';
import { useOrders } from '@/hooks';
import { APP_LOGIN } from '@/consts/urls';
import { usePathname } from 'next/navigation';
import { isOrderResponseArray } from '@/predicates';
import { ConnectionError } from '@/components/errors';
import { OrderResponse } from '@/types';

export default function Orders() {
  const locationId = usePathname().split('/')[3];
  const router = useRouter();
  const { error, isError, isLoading, data } = useOrders(locationId);
  if (isError) {
    console.log(`Received error ${error}`);
    // router.push(APP_LOGIN);
  }
  const orders = data?.data;
  if (isLoading || !orders) {
    return <Spinner />;
  }
  if (!isOrderResponseArray(orders)) {
    return <ConnectionError message='Failed to load orders' />;
  }

  return (
    <div className='flex w-full flex-col items-center justify-center'>
      {orders.map((order: OrderResponse) => (
        <Order key={order.id} {...order} />
      ))}
      {orders.length === 0 && <span>No items found</span>}
    </div>
  );
}

function Order(order: OrderResponse) {
  return (
    <>
      <span>ID {order.id}</span>
      <span>Name {order.name}</span>
      <span>Price/Item {order.pricePerItem}</span>
      <span>Quantity {order.quantity}</span>
      <span>Total {order.pricePerItem * order.quantity}</span>
    </>
  );
}
