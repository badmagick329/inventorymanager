'use client';

import {
  AmountPaidDueContent,
  PriceFieldContent,
  ProfitContent,
} from '@/components';
import { DeleteSale, SalesTableCellValue } from '@/types';
import { Key } from 'react';

import { ActionsContent } from '.';

type SaleTableContentProps = {
  columnKey: Key;
  cellValue: SalesTableCellValue;
  quantity: number;
  rowId: number;
  locationId: string;
  orderId: string;
  deleteSale: DeleteSale;
};
export default function SalesTableContent({
  columnKey,
  cellValue,
  quantity,
  rowId,
  locationId,
  orderId,
  deleteSale,
}: SaleTableContentProps) {
  if (isAmountPaidDue(columnKey, cellValue)) {
    const [amountPaid, debt] = cellValue;
    return <AmountPaidDueContent amountPaid={amountPaid} debt={debt} />;
  }
  if (isPriceField(columnKey, cellValue)) {
    return <PriceFieldContent value={cellValue} quantity={quantity} />;
  }
  if (isProfit(columnKey, cellValue)) {
    return (
      <ProfitContent profit={cellValue} profitPerItem={cellValue / quantity} />
    );
  }
  if (isSalePrice(columnKey, cellValue)) {
    const [salePrice, salePricePerItem] = cellValue;
    return (
      <PriceFieldContent value={salePrice} calculatedValue={salePricePerItem} />
    );
  }
  if (columnKey === 'actions') {
    return (
      <ActionsContent
        rowId={rowId}
        locationId={locationId}
        orderId={orderId}
        deleteSale={deleteSale}
      />
    );
  }

  return <span data-testid={`sales-${columnKey}`}>{cellValue}</span>;
}

function isAmountPaidDue(
  columnKey: Key,
  value: SalesTableCellValue
): value is [number, number] {
  return (
    columnKey === 'amountPaidDue' &&
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((v) => typeof v === 'number')
  );
}

function isPriceField(
  columnKey: Key,
  value: SalesTableCellValue
): value is number {
  return columnKey === 'cost' && typeof value === 'number';
}

function isSalePrice(
  columnKey: Key,
  value: SalesTableCellValue
): value is [number, number] {
  return (
    columnKey === 'salePrice' &&
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((v) => typeof v === 'number')
  );
}

function isProfit(columnKey: Key, value: SalesTableCellValue): value is number {
  return columnKey === 'profit' && typeof value === 'number';
}
