'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from '@nextui-org/react';
import { createSalesTableData } from '@/utils';
import { DeleteSale, SaleResponse } from '@/types';
import SalesTableContent from './sales-table-content';

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
    <Table aria-label='Items Table'>
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody emptyContent={'No items added'}>
        {tableData.map((row) => (
          <TableRow key={row.id}>
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
