'use client';

import { DeleteOrder, OrderResponse } from '@/types';
import { createOrdersTableData } from '@/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from '@nextui-org/react';

import { OrdersTableContent } from '.';

type OrdersTableProps = {
  locationId: string;
  orders: OrderResponse[];
  deleteOrder: DeleteOrder;
};

export default function OrdersTable({
  locationId,
  orders,
  deleteOrder,
}: OrdersTableProps) {
  const tableData = createOrdersTableData(orders);
  const columns = [
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

  return (
    <Table data-testid='items-table' aria-label='Items Table'>
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
                  <OrdersTableContent
                    columnKey={columnKey}
                    cellValue={cellValue}
                    rowId={row.id}
                    locationId={locationId}
                    deleteOrder={deleteOrder}
                    quantity={row.quantity}
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
