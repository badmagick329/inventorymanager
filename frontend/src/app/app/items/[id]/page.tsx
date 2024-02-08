'use client';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/loaders';
import { useOrders } from '@/hooks';
import { APP_LOGIN } from '@/consts/urls';
import { usePathname } from 'next/navigation';
import { isOrderResponseArray } from '@/predicates';
import { ConnectionError } from '@/components/errors';
import { OrderResponse } from '@/types';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Spacer,
} from '@nextui-org/react';
import { formatNumber } from '@/utils';

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

  const columns = [
    // { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Purchase Price' },
    { key: 'quantity', label: 'Quantity' },
  ];
  const tableData = createTableData(orders);

  return (
    <div className='flex w-full flex-col justify-center p-4'>
      <Spacer y={4} />
      <Table aria-label='Items Table'>
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={'No items added'}>
          {tableData.map((row) => (
            <TableRow key={row.id}>
              {(columnKey) => (
                <TableCell>{getKeyValue(row, columnKey)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function createTableData(orders: OrderResponse[]) {
  return orders.map((order) => {
    const totalPrice = order.pricePerItem * order.quantity;
    const priceString = `${formatNumber(totalPrice)} (${formatNumber(order.pricePerItem)}/item)`;
    return {
      id: order.id,
      name: order.name,
      price: priceString,
      quantity: order.quantity,
    };
  });
}
