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
import { Link } from '@heroui/react';
import { ChevronLeft, ReceiptText } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import {
  CreateSaleModal,
  OrderCard,
  SalesTanStackTable,
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
    <main className='min-w-0 max-w-full px-4 py-6 lg:px-6 lg:py-8'>
      <header className='mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='min-w-0'>
          <Link
            data-testid='sales-back-to-items-button'
            href={`${APP_ITEMS}/${locationId}`}
            color='foreground'
            className='mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
          >
            <ChevronLeft size={16} />
            {currentOrder.location} inventory
          </Link>
          <div className='flex items-center gap-3'>
            <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary'>
              <ReceiptText size={22} />
            </span>
            <div className='min-w-0'>
              <h1 className='truncate text-2xl font-semibold tracking-tight'>
                {currentOrder.name}
              </h1>
              <p className='text-sm text-muted-foreground'>
                {formatPurchaseDate(currentOrder.date)} ·{' '}
                {currentOrder.quantity.toLocaleString('en-PK')} units purchased
              </p>
            </div>
          </div>
        </div>
        <CreateSaleModal
          locationId={locationId}
          orderId={orderId}
          remainingStock={remainingStock}
        />
      </header>

      <OrderCard
        pricePerItem={currentOrder.pricePerItem}
        currentSalePrice={currentOrder.currentSalePrice}
        quantity={currentOrder.quantity}
        soldQuantity={currentOrder.soldQuantity}
        profit={currentOrder.profit}
        debt={currentOrder.debt}
        amountPaid={currentOrder.amountPaid}
        salesCount={sales.length}
      />

      <div className='mt-4'>
        <VendorsCard vendors={orderVendors} locationId={locationId} />
      </div>

      <section className='mt-8' aria-labelledby='sales-history-heading'>
        <div className='mb-3 flex items-end justify-between gap-4'>
          <div>
            <h2 id='sales-history-heading' className='text-lg font-semibold'>
              Sales history
            </h2>
            <p className='text-sm text-muted-foreground'>
              {sales.length.toLocaleString('en-PK')}{' '}
              {sales.length === 1 ? 'recorded sale' : 'recorded sales'}
            </p>
          </div>
        </div>
        <SalesTanStackTable
          locationId={locationId}
          orderId={orderId}
          sales={sales}
          deleteSale={deleteSale}
        />
      </section>
    </main>
  );
}

function formatPurchaseDate(date: string | null) {
  if (!date) return 'Purchase date not recorded';

  return `Purchased ${new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))}`;
}
