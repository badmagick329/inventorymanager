'use client';
import { Key } from 'react';
import { OrdersTableRowValue } from '@/types';
import ProfitContent from './profit-content';
import AmountPaidDueContent from './amount-paid-due-content';
import StockInOutContent from './stock-in-out-content';
import ActionsContent from './actions-content';
import { DeleteOrder } from '@/types';
import PriceFieldContent from './price-field-content';

type OrdersTableContentProps = {
  columnKey: Key;
  rowValue: OrdersTableRowValue;
  rowId: number;
  locationId: string;
  deleteOrder: DeleteOrder;
  quantity: number;
};

export default function OrdersTableContent({
  columnKey,
  rowValue,
  rowId,
  locationId,
  deleteOrder,
  quantity,
}: OrdersTableContentProps) {
  if (isProfit(columnKey, rowValue)) {
    const [profit, profitPerItem] = rowValue;
    return <ProfitContent profit={profit} profitPerItem={profitPerItem} />;
  }
  if (isAmountPaidDue(columnKey, rowValue)) {
    const [amountPaid, debt] = rowValue;
    return <AmountPaidDueContent amountPaid={amountPaid} debt={debt} />;
  }
  if (isStockInOut(columnKey, rowValue)) {
    const [stockIn, stockOut] = rowValue;
    return <StockInOutContent stockIn={stockIn} stockOut={stockOut} />;
  }
  if (isActionsField(columnKey)) {
    return (
      <ActionsContent
        rowId={rowId}
        locationId={locationId}
        deleteOrder={deleteOrder}
      />
    );
  }
  if (isPriceField(columnKey, rowValue)) {
    return <PriceFieldContent value={rowValue} quantity={quantity} />;
  }

  return <span>{rowValue}</span>;
}

function isProfit(
  columnKey: Key,
  value: OrdersTableRowValue
): value is [number, number] {
  return Array.isArray(value) && columnKey === 'profit';
}

function isAmountPaidDue(
  columnKey: Key,
  value: OrdersTableRowValue
): value is [number, number] {
  return Array.isArray(value) && columnKey === 'amountPaidDue';
}

function isStockInOut(
  columnKey: Key,
  value: OrdersTableRowValue
): value is [number, number] {
  return Array.isArray(value) && columnKey === 'stockInOut';
}

function isPriceField(
  columnKey: Key,
  value: OrdersTableRowValue
): value is number {
  return (
    typeof value === 'number' &&
    (columnKey === 'cost' || columnKey === 'salePrice')
  );
}

function isActionsField(columnKey: Key): boolean {
  return columnKey === 'actions';
}
