'use client';
import { Key } from 'react';
import { OrdersTableCellValue } from '@/types';
import StockInOutContent from './stock-in-out-content';
import ActionsContent from './actions-content';
import { DeleteOrder } from '@/types';
import AmountPaidDueContent from '@/components/amount-paid-due-content';
import PriceFieldContent from '@/components/price-field-content';
import ProfitContent from '@/components/profit-content';
import { Link } from '@nextui-org/react';
import { APP_ITEMS } from '@/consts/urls';

type OrdersTableContentProps = {
  columnKey: Key;
  cellValue: OrdersTableCellValue;
  rowId: number;
  locationId: string;
  deleteOrder: DeleteOrder;
  quantity: number;
};

export default function OrdersTableContent({
  columnKey,
  cellValue,
  rowId,
  locationId,
  deleteOrder,
  quantity,
}: OrdersTableContentProps) {
  if (columnKey === 'name') {
    return (
      <Link
        color='foreground'
        href={`${APP_ITEMS}/${locationId}/${rowId}`}
        className='flex justify-start gap-2 pr-4 font-semibold'
      >
        {cellValue}
      </Link>
    );
  }
  if (isProfit(columnKey, cellValue)) {
    const [profit, profitPerItem] = cellValue;
    return <ProfitContent profit={profit} profitPerItem={profitPerItem} />;
  }
  if (isAmountPaidDue(columnKey, cellValue)) {
    const [amountPaid, debt] = cellValue;
    return <AmountPaidDueContent amountPaid={amountPaid} debt={debt} />;
  }
  if (isStockInOut(columnKey, cellValue)) {
    const [stockIn, stockOut] = cellValue;
    return <StockInOutContent stockIn={stockIn} stockOut={stockOut} />;
  }
  if (columnKey === 'actions') {
    return (
      <ActionsContent
        rowId={rowId}
        locationId={locationId}
        deleteOrder={deleteOrder}
      />
    );
  }
  if (isPriceField(columnKey, cellValue)) {
    return <PriceFieldContent value={cellValue} quantity={quantity} />;
  }

  return <span>{cellValue}</span>;
}

function isProfit(
  columnKey: Key,
  value: OrdersTableCellValue
): value is [number, number] {
  return Array.isArray(value) && columnKey === 'profit';
}

function isAmountPaidDue(
  columnKey: Key,
  value: OrdersTableCellValue
): value is [number, number] {
  return Array.isArray(value) && columnKey === 'amountPaidDue';
}

function isStockInOut(
  columnKey: Key,
  value: OrdersTableCellValue
): value is [number, number] {
  return Array.isArray(value) && columnKey === 'stockInOut';
}

function isPriceField(
  columnKey: Key,
  value: OrdersTableCellValue
): value is number {
  return (
    typeof value === 'number' &&
    (columnKey === 'cost' || columnKey === 'salePrice')
  );
}
