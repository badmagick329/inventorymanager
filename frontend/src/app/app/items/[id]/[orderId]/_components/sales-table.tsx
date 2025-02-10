'use client';

import { DeleteSale, SaleResponse } from '@/types';
import { createSalesTableData } from '@/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from "@heroui/react";

import { SalesTableContent } from '.';

type SalesTableProps = {
  locationId: string;
  orderId: string;
  sales: SaleResponse[];
  deleteSale: DeleteSale;
};

export default function SalesTable({
  locationId,
  orderId,
  sales,
  deleteSale,
}: SalesTableProps) {
  const tableData = createSalesTableData(sales);
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'saleDate', label: 'Sale Date' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'cost', label: 'Cost' },
    { key: 'salePrice', label: 'Sale Price' },
    { key: 'profit', label: 'Profit' },
    { key: 'amountPaidDue', label: 'Amount Paid / Due' },
    { key: 'lastModifiedBy', label: 'Last Modified By' },
    { key: 'lastModified', label: 'Last Modified' },
    { key: 'actions', label: 'Actions' },
  ];

  return (
    <Table data-testid='sales-table' aria-label='Sales Table'>
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody emptyContent={'No sales added'}>
        {tableData.map((row) => (
          <TableRow data-testid='sales-table-row' key={row.id}>
            {(columnKey) => {
              const cellValue = getKeyValue(row, columnKey);
              return (
                <TableCell>
                  <SalesTableContent
                    columnKey={columnKey}
                    cellValue={cellValue}
                    quantity={row.quantity}
                    rowId={row.id}
                    locationId={locationId}
                    orderId={orderId}
                    deleteSale={deleteSale}
                  />
                </TableCell>
              );
            }}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
