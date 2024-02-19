'use client';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/loaders';
import { useSales } from '@/hooks';
import { APP_ITEMS, APP_LOGIN } from '@/consts/urls';
import { usePathname } from 'next/navigation';
import { isOrderResponse, isSaleResponseArray } from '@/predicates';
import { ConnectionError } from '@/components/errors';
import { Spacer, Button, Link } from '@nextui-org/react';
import CreateSaleModal from './_componenets/create-sale-modal';
import { useDeleteSale, useOrderDetail } from '@/hooks';
import SalesTable from './_componenets/sales-table';
import OrderCard from './_componenets/order-card';

export default function Sales() {
  const locationId = usePathname().split('/')[3];
  const orderId = usePathname().split('/')[4];
  const router = useRouter();
  const { error, isError, isLoading, data: sales } = useSales(orderId);
  const deleteSale = useDeleteSale();
  const {
    error: orderError,
    isError: orderIsError,
    isLoading: orderIsLoading,
    data: orderData,
  } = useOrderDetail(locationId, orderId);

  if (isError || orderIsError) {
    console.log('Received errors', error, orderError);
    router.push(APP_LOGIN);
  }
  const currentOrder = orderData;
  if (isLoading || !sales || orderIsLoading || !orderData) {
    return <Spinner />;
  }
  if (!isSaleResponseArray(sales) || !isOrderResponse(currentOrder)) {
    return <ConnectionError message='Failed to load sales' />;
  }

  const remainingStock = currentOrder.quantity - currentOrder.soldQuantity;

  return (
    <div className='flex w-full flex-col justify-center p-4'>
      <Spacer y={2} />
      <OrderCard
        name={currentOrder.name}
        pricePerItem={currentOrder.pricePerItem}
        currentSalePrice={currentOrder.currentSalePrice}
        quantity={currentOrder.quantity}
        remainingStock={remainingStock}
      />
      <Spacer y={2} />
      <div className='flex justify-center gap-4'>
        <CreateSaleModal
          locationId={locationId}
          orderId={orderId}
          remainingStock={remainingStock}
        />
        <Button
          as={Link}
          href={`${APP_ITEMS}/${locationId}`}
          variant='flat'
          size='md'
          color='default'
        >
          Back to Items
        </Button>
      </div>
      <Spacer y={4} />
      <SalesTable
        locationId={locationId}
        orderId={orderId}
        sales={sales}
        deleteSale={deleteSale}
      />
    </div>
  );
}
