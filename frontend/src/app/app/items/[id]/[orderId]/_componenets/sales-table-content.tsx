'use client';
import { Key } from 'react';
import { SalesTableCellValue } from '@/types';
import ActionsContent from './actions-content';
import { DeleteSale } from '@/types';
import AmountPaidDueContent from '@/components/amount-paid-due-content';
import PriceFieldContent from '@/components/price-field-content';
import ProfitContent from '@/components/profit-content';

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

  return <span>{cellValue}</span>;
}

function isAmountPaidDue(
  columnKey: Key,
  value: SalesTableCellValue
): value is [number, number] {
  return columnKey === 'amountPaidDue' && Array.isArray(value);
}

function isPriceField(
  columnKey: Key,
  value: SalesTableCellValue
): value is number {
  return columnKey === 'cost' && typeof value === 'number';
}

function isProfit(columnKey: Key, value: SalesTableCellValue): value is number {
  return columnKey === 'profit' && typeof value === 'number';
}
