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
import { createOrdersTableData } from '@/utils';
import { DeleteOrder } from '@/types';

import OrdersTableContent from './orders-table-content';
import { AsyncListData } from '@react-stately/data';

type OrdersTableProps = {
  locationId: string;
  list: AsyncListData<unknown>;
  deleteOrder: DeleteOrder;
};

type TableData = ReturnType<typeof createOrdersTableData>;

export default function OrdersTable({
  locationId,
  list,
  deleteOrder,
}: OrdersTableProps) {
  const tableData = list.items as TableData;
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

  function shouldAllowSorting(columnKey: string) {
    const sortableColumns = [
      'quantity',
      'cost',
      'salePrice',
      'lastModified',
      'profit',
      'purchaseDate',
    ];
    return sortableColumns.includes(columnKey);
  }

  return (
    <Table
      aria-label='Items Table'
      sortDescriptor={list.sortDescriptor}
      onSortChange={list.sort}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            allowsSorting={shouldAllowSorting(column.key)}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={'No items added'} items={tableData}>
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
