'use client';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/loaders';
import { useOrders, useSales } from '@/hooks';
import { APP_LOGIN, APP_SALES } from '@/consts/urls';
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
  Selection,
  Button,
  Link,
} from '@nextui-org/react';
import { formatNumber } from '@/utils';
import {
  ShoppingCart,
  ArrowUpIcon,
  Check,
  Pencil,
  Trash,
  List,
} from 'lucide-react';
import { ICON_SM } from '@/consts';
import CreateOrderModal from './_componenets/create-order-modal';

export default function Orders() {
  const locationId = usePathname().split('/')[3];
  const router = useRouter();
  const { error, isError, isLoading, data } = useOrders(locationId);
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
    { key: 'amountPaidDue', label: 'Amount Paid / Due' },
    { key: 'profit', label: 'Profit' },
    { key: 'stockInOut', label: 'Stock In / Out' },
    { key: 'vendors', label: 'Vendor(s)' },
    { key: 'actions', label: 'Actions' },
  ];
  const tableData = createTableData(orders);

  return (
    <div className='flex w-full flex-col justify-center p-4'>
      <Spacer y={2} />
      <CreateOrderModal locationId={locationId} />
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
                  const [amountPaid, debt] = text.split(' / ');
                  const paidColor =
                    parseFloat(amountPaid) > 0
                      ? 'text-success-600'
                      : 'text-foreground';
                  const debtColor =
                    parseFloat(debt) > 0
                      ? 'text-danger-500'
                      : 'text-foreground';
                  return (
                    <TableCell>
                      <span className={paidColor}>{amountPaid}</span>
                      <span> / </span>
                      <span className={debtColor}>{debt}</span>
                    </TableCell>
                  );
                }
                if (columnKey === 'profit') {
                  const profit = parseFloat(text);
                  let profitColor;
                  if (profit < 0) {
                    profitColor = 'text-danger-500';
                  } else if (profit === 0) {
                    profitColor = 'text-foreground';
                  } else {
                    profitColor = 'text-success-600';
                  }
                  return <TableCell className={profitColor}>{text}</TableCell>;
                }
                if (columnKey === 'stockInOut') {
                  let [stockIn, stockOut] = text.split(' / ');
                  stockOut = parseInt(stockOut);
                  stockIn = parseInt(stockIn);
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
                        <ShoppingCart size={16} />
                        {stockIn}
                      </span>
                      <span className={`flex gap-2 ${outColor}`}>
                        <ArrowUpIcon size={16} />
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
                      <Button size='sm' variant='flat' isIconOnly>
                        <Trash size={ICON_SM} />
                      </Button>
                      <Button
                        as={Link}
                        href={`${APP_SALES}/${row.id}`}
                        size='sm'
                        variant='flat'
                        isIconOnly
                      >
                        <List size={ICON_SM} />
                      </Button>
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
    const amountPaidDue = `${formatNumber(amountPaid)} / ${formatNumber(order.debt)}`;
    const profit = order.profit;
    const profitPerItem = order.profitPerItem;
    const remainingStock = order.quantity - order.soldQuantity;
    const stockString = `${remainingStock} / ${order.soldQuantity}`;

    let profitString;
    if (profit > 0) {
      profitString = `${formatNumber(profit)} [${formatNumber(profitPerItem)} ea.]`;
    } else {
      profitString = formatNumber(profit);
    }
    return {
      id: order.id,
      name: order.name,
      cost: `${formatNumber(totalPrice)}`,
      purchaseDate: order.date,
      profit: profitString,
      quantity: order.quantity,
      debt: formatNumber(order.debt),
      amountPaidDue,
      stockInOut: stockString,
      vendors: order.vendors.join(', '),
    };
  });
}
