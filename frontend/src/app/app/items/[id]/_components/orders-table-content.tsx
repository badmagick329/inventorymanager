'use client';

import {
  AmountPaidDueContent,
  PriceFieldContent,
  ProfitContent,
} from '@/components';
import { APP_ITEMS } from '@/consts/urls';
import { DeleteOrder, OrdersTableCellValue } from '@/types';
import { Link } from "@heroui/react";
import { Key } from 'react';

import ActionsContent from './actions-content';
import StockInOutContent from './stock-in-out-content';

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
        data-testid='items-order-link'
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

  return <span data-testid={`items-order-${columnKey}`}>{cellValue}</span>;
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
