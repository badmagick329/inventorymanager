'use client';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/loaders';
import { useOrders } from '@/hooks';
import { APP_LOGIN, APP_SALES, APP_ITEMS, APP_LOCATIONS } from '@/consts/urls';
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
  Button,
  Link,
} from '@nextui-org/react';
import { formatNumber } from '@/utils';
import { ShoppingCart, ArrowUpIcon, Pencil, Trash, List } from 'lucide-react';
import { ICON_SM } from '@/consts';
import CreateOrderModal from './_componenets/create-order-modal';
import { useDeleteOrder } from '@/hooks';

export default function Orders() {
  const locationId = usePathname().split('/')[3];
  const router = useRouter();
  const { error, isError, isLoading, data } = useOrders(locationId);
  const deleteOrder = useDeleteOrder();
  if (isError) {
    console.log(`Received error ${error}`);
    router.push(APP_LOGIN);
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
    { key: 'purchaseDate', label: 'Purchase Date' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'cost', label: 'Cost' },
    { key: 'salePrice', label: 'Sale Price' },
    { key: 'amountPaidDue', label: 'Amount Paid / Due' },
    { key: 'profit', label: 'Profit' },
    { key: 'stockInOut', label: 'Stock In / Out' },
    { key: 'vendors', label: 'Sold to' },
    { key: 'lastModifiedBy', label: 'Last Modified By' },
    { key: 'lastModified', label: 'Last Modified' },
    { key: 'actions', label: 'Actions' },
  ];
  const tableData = createTableData(orders);

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
      <Table aria-label='Items Table'>
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={'No items added'}>
          {tableData.map((row) => (
            <TableRow key={row.id}>
              {(columnKey) => {
                const text = getKeyValue(row, columnKey);
                if (columnKey === 'amountPaidDue') {
                  const [amountPaid, debt] = text;
                  const paidColor =
                    amountPaid > 0 ? 'text-success-600' : 'text-foreground';
                  const debtColor =
                    debt > 0 ? 'text-danger-500' : 'text-foreground';
                  return (
                    <TableCell>
                      <span className={paidColor}>
                        {formatNumber(amountPaid)}
                      </span>
                      <span> / </span>
                      <span className={debtColor}>{formatNumber(debt)}</span>
                    </TableCell>
                  );
                }
                if (columnKey === 'profit') {
                  const [profit, profitPerItem] = text;
                  let profitColor;
                  if (profit === 0) {
                    profitColor = 'text-foreground';
                  } else if (profit < 0) {
                    profitColor = 'text-danger-500';
                  } else {
                    profitColor = 'text-success-600';
                  }
                  return (
                    <TableCell className={profitColor}>
                      {formatNumber(profit)} [{formatNumber(profitPerItem)} ea.]
                    </TableCell>
                  );
                }
                if (columnKey === 'stockInOut') {
                  const [stockIn, stockOut] = text;
                  let outColor;
                  if (stockOut > 0 && stockIn > 0) {
                    outColor = 'text-primary-500';
                  } else if (stockOut > 0 && stockIn === 0) {
                    outColor = 'text-success-600';
                  } else {
                    outColor = 'text-foreground';
                  }
                  let inColor;
                  if (stockIn > 0 && stockOut > 0) {
                    inColor = 'text-primary-500';
                  } else if (stockIn > 0 && stockOut === 0) {
                    inColor = 'text-foreground';
                  } else {
                    inColor = 'text-success-600';
                  }
                  return (
                    <TableCell className='flex gap-2'>
                      <span className={`flex gap-2 ${inColor}`}>
                        <ShoppingCart size={ICON_SM} />
                        {stockIn}
                      </span>
                      <span className={`flex gap-2 ${outColor}`}>
                        <ArrowUpIcon size={ICON_SM} />
                        {stockOut}
                      </span>
                    </TableCell>
                  );
                }
                if (columnKey === 'actions') {
                  return (
                    <TableCell className='flex gap-2'>
                      <Button size='sm' variant='flat' isIconOnly>
                        <Pencil size={ICON_SM} />
                      </Button>
                      <Button
                        size='sm'
                        variant='flat'
                        isIconOnly
                        onClick={() => deleteOrder.mutate(row.id)}
                      >
                        <Trash size={ICON_SM} />
                      </Button>
                      <Button
                        as={Link}
                        href={`${APP_ITEMS}/${locationId}/${row.id}`}
                        size='sm'
                        variant='flat'
                        isIconOnly
                      >
                        <List size={ICON_SM} />
                      </Button>
                    </TableCell>
                  );
                }
                if (columnKey === 'cost' || columnKey === 'salePrice') {
                  return (
                    <TableCell>
                      {formatNumber(text)} [{formatNumber(text / row.quantity)}{' '}
                      ea.]
                    </TableCell>
                  );
                }

                return <TableCell>{getKeyValue(row, columnKey)}</TableCell>;
              }}
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
    const amountPaid = order.amountPaid;
    const amountPaidDue = [amountPaid, order.debt];
    const profit = order.profit;
    const profitPerItem = order.profitPerItem;
    const remainingStock = order.quantity - order.soldQuantity;
    const stockInOut = [remainingStock, order.soldQuantity];
    const vendors = Array.from(new Set(order.vendors));
    const vendorsString =
      vendors.length > 2
        ? vendors.slice(0, 2).join(', ') + '...'
        : vendors.join(', ');
    const lastModifiedBy = order.lastModifiedBy;
    const lastModifiedUTC = new Date(order.lastModified).getTime();
    const offset = new Date().getTimezoneOffset();
    const lastModified = new Date(
      lastModifiedUTC - offset * 60000
    ).toLocaleString();

    const profitValues = [profit, profitPerItem];
    return {
      id: order.id,
      name: order.name,
      purchaseDate: order.date,
      quantity: order.quantity,
      cost: totalPrice,
      salePrice: order.currentSalePrice * order.quantity,
      amountPaidDue,
      profit: profitValues,
      stockInOut,
      vendors: vendorsString,
      lastModifiedBy,
      lastModified,
    };
  });
}
