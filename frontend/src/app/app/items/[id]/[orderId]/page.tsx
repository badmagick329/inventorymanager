'use client';

import { ConnectionError, Spinner } from '@/components';
import { APP_ITEMS, APP_LOGIN } from '@/consts/urls';
import {
  useDeleteSale,
  useOrderDetail,
  useOrderVendors,
  useSales,
} from '@/hooks';
import {
  isOrderResponse,
  isSaleResponseArray,
  isVendorResponseArray,
} from '@/predicates';
import { Button, Link, Spacer } from '@nextui-org/react';
import { usePathname, useRouter } from 'next/navigation';

import {
  CreateSaleModal,
  OrderCard,
  SalesTable,
  VendorsCard,
} from './_components';

export default function Sales() {
  // TODO: Refactor this to use a hook
  const locationId = usePathname().split('/')[3];
  const orderId = usePathname().split('/')[4];
  const router = useRouter();
  const { error, isError, isLoading, data: sales } = useSales(orderId);
  const deleteSale = useDeleteSale();
  const {
    error: vendorError,
    isError: vendorIsError,
    isLoading: vendorIsLoading,
    data: orderVendors,
  } = useOrderVendors(orderId);
  const {
    error: orderError,
    isError: orderIsError,
    isLoading: orderIsLoading,
    data: orderData,
  } = useOrderDetail(locationId, orderId);

  if (isError || orderIsError || vendorIsError) {
    console.error('Received errors', error, orderError, vendorError);
    router.push(APP_LOGIN);
  }
  const currentOrder = orderData;
  if (
    isLoading ||
    !sales ||
    orderIsLoading ||
    !orderData ||
    vendorIsLoading ||
    !orderVendors
  ) {
    return <Spinner />;
  }

  if (
    !isSaleResponseArray(sales) ||
    !isOrderResponse(currentOrder) ||
    !isVendorResponseArray(orderVendors)
  ) {
    return <ConnectionError message='Failed to load sales data' />;
  }

  const remainingStock = currentOrder.quantity - currentOrder.soldQuantity;

  return (
    <div className='flex w-full flex-col justify-center p-4'>
      <Spacer y={2} />
      <div className='flex w-full flex-wrap justify-center gap-2 md:gap-[4rem]'>
        <OrderCard
          name={currentOrder.name}
          pricePerItem={currentOrder.pricePerItem}
          currentSalePrice={currentOrder.currentSalePrice}
          quantity={currentOrder.quantity}
          remainingStock={remainingStock}
        />
        <VendorsCard vendors={orderVendors} />
      </div>
      <Spacer y={2} />
      <div className='flex justify-center gap-4'>
        <Button
          data-testid='sales-back-to-items-button'
          as={Link}
          href={`${APP_ITEMS}/${locationId}`}
          variant='flat'
          radius='sm'
          color='default'
        >
          Back to Items
        </Button>
        <CreateSaleModal
          locationId={locationId}
          orderId={orderId}
          remainingStock={remainingStock}
        />
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
