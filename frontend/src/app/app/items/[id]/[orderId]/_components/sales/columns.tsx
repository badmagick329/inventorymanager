'use client';

import { ColumnDef } from '@tanstack/react-table';

import {
  AmountPaidDueContent,
  PriceFieldContent,
  ProfitContent,
} from '@/components';
import { DeleteSale, SaleResponse } from '@/types';
import { TableColumnHeader } from '@/app/app/items/_table/column-header';
import ActionsContent from '../actions-content';

const textSizeStyle = 'text-sm md:text-base';

export function getSalesColumns({
  locationId,
  orderId,
  deleteSale,
}: {
  locationId: string;
  orderId: string;
  deleteSale: DeleteSale;
}): ColumnDef<SaleResponse>[] {
  return [
    {
      accessorKey: 'order',
      id: 'name',
      header: ({ column }) => <TableColumnHeader column={column} title='Name' />,
      cell: ({ row }) => <span data-testid='sales-name'>{row.original.order}</span>,
    },
    {
      accessorKey: 'vendor',
      header: ({ column }) => <TableColumnHeader column={column} title='Vendor' />,
      cell: ({ row }) => <span data-testid='sales-vendor'>{row.original.vendor}</span>,
    },
    {
      accessorKey: 'date',
      id: 'saleDate',
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Sale Date' />
      ),
      cell: ({ row }) => <span>{row.original.date}</span>,
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Quantity' />
      ),
      cell: ({ row }) => (
        <span data-testid='sales-quantity'>{row.original.quantity}</span>
      ),
    },
    {
      accessorKey: 'cost',
      header: ({ column }) => <TableColumnHeader column={column} title='Cost' />,
      cell: ({ row }) => (
        <PriceFieldContent value={row.original.cost} quantity={row.original.quantity} />
      ),
    },
    {
      accessorKey: 'pricePerItem',
      id: 'salePrice',
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Sale Price' />
      ),
      cell: ({ row }) => {
        const totalSalePrice = row.original.pricePerItem * row.original.quantity;
        return (
          <PriceFieldContent
            value={totalSalePrice}
            calculatedValue={row.original.pricePerItem}
          />
        );
      },
      sortingFn: (rowA, rowB) => {
        const totalA = rowA.original.pricePerItem * rowA.original.quantity;
        const totalB = rowB.original.pricePerItem * rowB.original.quantity;
        return totalA - totalB;
      },
    },
    {
      id: 'profit',
      header: ({ column }) => <TableColumnHeader column={column} title='Profit' />,
      accessorFn: (row) => row.pricePerItem * row.quantity - row.cost,
      cell: ({ row }) => {
        const profit = row.original.pricePerItem * row.original.quantity - row.original.cost;
        return <ProfitContent profit={profit} profitPerItem={profit / row.original.quantity} />;
      },
    },
    {
      id: 'amountPaidDue',
      accessorFn: (row) => row.pricePerItem * row.quantity - row.debt,
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Amount Paid / Due' />
      ),
      cell: ({ row }) => {
        const amountPaid = row.original.pricePerItem * row.original.quantity - row.original.debt;
        return <AmountPaidDueContent amountPaid={amountPaid} debt={row.original.debt} />;
      },
    },
    {
      accessorKey: 'lastModifiedBy',
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Last Modified By' />
      ),
      cell: ({ row }) => <span className={textSizeStyle}>{row.original.lastModifiedBy}</span>,
    },
    {
      accessorKey: 'lastModified',
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Last Modified' />
      ),
      cell: ({ row }) => (
        <span className={textSizeStyle}>
          {new Date(row.original.lastModified).toLocaleString()}
        </span>
      ),
      sortingFn: (rowA, rowB) =>
        new Date(rowA.original.lastModified).getTime() -
        new Date(rowB.original.lastModified).getTime(),
    },
    {
      id: 'actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <ActionsContent
          rowId={row.original.id}
          locationId={locationId}
          orderId={orderId}
          deleteSale={deleteSale}
        />
      ),
    },
  ];
}
