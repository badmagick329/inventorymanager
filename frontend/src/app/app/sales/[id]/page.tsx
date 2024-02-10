'use client';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/loaders';
import { useSales } from '@/hooks';
import { APP_LOGIN } from '@/consts/urls';
import { usePathname } from 'next/navigation';
import { isSaleResponseArray } from '@/predicates';
import { ConnectionError } from '@/components/errors';
import { SaleResponse } from '@/types';
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

export default function Sales() {
  const orderId = usePathname().split('/')[3];
  const router = useRouter();
  const { error, isError, isLoading, data } = useSales(orderId);
  if (isError) {
    console.log(`Received error ${error}`);
    // router.push(APP_LOGIN);
  }
  const sales = data?.data;
  if (isLoading || !sales) {
    return <Spinner />;
  }
  if (!isSaleResponseArray(sales)) {
    return <ConnectionError message='Failed to load sales' />;
  }

  const columns = [
    // { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'saleDate', label: 'Sale Date' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'cost', label: 'Cost' },
    { key: 'salePrice', label: 'Sale Price' },
    { key: 'amountPaid', label: 'amountPaid' },
    { key: 'actions', label: 'Actions' },
  ];
  const tableData = createTableData(sales);

  return (
    <div className='flex w-full flex-col justify-center p-4'>
      {/* <Spacer y={2} /> */}
      {/* <CreateOrderModal locationId={locationId} /> */}
      {/* <Spacer y={4} /> */}
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
                if (columnKey === 'actions') {
                  return (
                    <TableCell className='flex gap-2'>
                      <Button size='sm' variant='flat' isIconOnly>
                        <Pencil size={ICON_SM} />
                      </Button>
                      <Button size='sm' variant='flat' isIconOnly>
                        <Trash size={ICON_SM} />
                      </Button>
                      <Button size='sm' variant='flat' isIconOnly>
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

function createTableData(sales: SaleResponse[]) {
  return sales.map((sale) => {
    // { key: 'name', label: 'Name' },
    // { key: 'vendor', label: 'Vendor' },
    // { key: 'saleDate', label: 'Sale Date' },
    // { key: 'quantity', label: 'Quantity' },
    // { key: 'cost', label: 'Cost' },
    // { key: 'salePrice', label: 'Sale Price' },
    // { key: 'amountPaid', label: 'amountPaid' },
    // { key: 'actions', label: 'Actions' },
    const totalSalePrice = sale.pricePerItem * sale.quantity;
    const amountPaid = totalSalePrice - sale.debt;
    const amountPaidDue = `${formatNumber(amountPaid)} / ${formatNumber(sale.debt)}`;
    const salePriceString = `${formatNumber(totalSalePrice)} [${formatNumber(sale.pricePerItem)} ea.]`;

    // let profitString;
    // if (profit > 0) {
    //   profitString = `${formatNumber(profit)} [${formatNumber(profitPerItem)} ea.]`;
    // } else {
    //   profitString = formatNumber(profit);
    // }
    return {
      id: sale.id,
      name: sale.order,
      vendor: sale.vendor,
      saleDate: sale.date,
      quantity: sale.quantity,
      cost: `${formatNumber(sale.cost)}`,
      salePrice: salePriceString,
      amountPaidDue,
    };
  });
}
