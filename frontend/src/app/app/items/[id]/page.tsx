'use client';
import { Spinner } from '@/components/loaders';
import { useLocations } from '@/hooks';
import { APP_LOCATIONS, APP_MANAGE_VENDORS, NEXT_ORDERS } from '@/consts/urls';
import { usePathname } from 'next/navigation';
import { Spacer, Button, Link } from '@nextui-org/react';
import CreateOrderModal from './_componenets/create-order-modal';
import { useDeleteOrder } from '@/hooks';
import OrdersTable from './_componenets/orders-table';
import { useState } from 'react';
import { Location } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { preFetchVendors as preFetchAdditionalVendorDetails } from '@/utils/requests';
import MoreInformation from './_componenets/more-information';
import { useAsyncList } from '@react-stately/data';
import axios from 'axios';
import { createOrdersTableData } from '@/utils';

export default function Orders() {
  const locationId = usePathname().split('/')[3];
  const { data: locations } = useLocations();
  const [detailsHidden, setDetailsHidden] = useState(true);
  const deleteOrder = useDeleteOrder();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);

  let list = useAsyncList({
    async load({ signal }) {
      const { data } = await axios.get(`${NEXT_ORDERS}/${locationId}`);
      isLoading && setIsLoading(false);
      const tableData = createOrdersTableData(data);
      return {
        items: tableData,
      };
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) => {
          // @ts-ignore
          let first = a[sortDescriptor.column];
          // @ts-ignore
          let second = b[sortDescriptor.column];
          if (Array.isArray(first)) {
            first = first[0];
          }
          if (Array.isArray(second)) {
            second = second[0];
          }
          if (Date.parse(first)) {
            first = new Date(first);
          }
          if (Date.parse(second)) {
            second = new Date(second);
          }
          let cmp =
            (parseInt(first) || first) < (parseInt(second) || second) ? -1 : 1;

          if (sortDescriptor.direction === 'descending') {
            cmp *= -1;
          }
          return cmp;
        }),
      };
    },
  });

  const location = locations?.find(
    (loc: Location) => loc.id.toString() === locationId
  );
  if (isLoading || list.isLoading) {
    return <Spinner />;
  }
  preFetchAdditionalVendorDetails(queryClient, locationId);

  if (list.error) {
    return <span>...</span>;
  }

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
      <div className='flex justify-center gap-4'>
        <CreateOrderModal locationId={locationId} />
        <Button
          variant='flat'
          size='md'
          color='default'
          onPress={() => setDetailsHidden(!detailsHidden)}
        >
          {detailsHidden ? 'Show More' : 'Hide'}
        </Button>
        <Button
          as={Link}
          href={`${APP_MANAGE_VENDORS}/${locationId}`}
          variant='flat'
          size='md'
          color='default'
        >
          Manage Vendors
        </Button>
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
        deleteOrder={deleteOrder}
        list={list}
      />
    </div>
  );
}
