'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Modal, useDisclosure } from '@heroui/react';

import { APP_ITEMS } from '@/consts/urls';
import { PriceFieldContent } from '@/components';
import DeleteModal from '@/components/delete-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteOrder, OrderResponse } from '@/types';
import { TableColumnHeader } from '@/app/app/items/_table/column-header';
import CreateOrderForm from '../create-order-form';

const textSizeStyle = 'text-sm md:text-base';

export function getOrderColumns(
  deleteOrder: DeleteOrder
): ColumnDef<OrderResponse>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <TableColumnHeader column={column} title='Name' />,
      cell: ({ row }) => (
        <Link
          data-testid='items-order-link'
          href={`${APP_ITEMS}/${row.original.locationId}/${row.original.id}`}
          className={`font-semibold hover:underline ${textSizeStyle}`}
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      id: 'purchase date',
      accessorKey: 'date',
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Purchase Date' />
      ),
      cell: ({ row }) => (
        <span className={textSizeStyle}>
          {row.original.date ? new Date(row.original.date).toLocaleDateString() : ''}
        </span>
      ),
      sortingFn: (rowA, rowB) =>
        compareNullableDate(rowA.original.date, rowB.original.date),
    },
    {
      id: 'stock total',
      accessorKey: 'quantity',
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Stock total' />
      ),
      cell: ({ row }) => {
        const isComplete = row.original.soldQuantity === row.original.quantity;
        return (
          <span
            data-testid='items-order-quantity'
            className={`${isComplete ? 'text-muted-foreground' : 'text-foreground'} ${textSizeStyle}`}
          >
            {row.original.quantity}
          </span>
        );
      },
    },
    {
      id: 'stock sold',
      accessorKey: 'soldQuantity',
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Stock sold' />
      ),
      cell: ({ row }) => {
        const isComplete = row.original.soldQuantity === row.original.quantity;
        return (
          <span
            className={`${isComplete ? 'text-muted-foreground' : 'text-foreground'} ${textSizeStyle}`}
          >
            {row.original.soldQuantity}
          </span>
        );
      },
    },
    {
      id: 'stock remaining',
      accessorKey: 'quantity',
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Stock remaining' />
      ),
      cell: ({ row }) => {
        const remaining = row.original.quantity - row.original.soldQuantity;
        const color =
          remaining < 0
            ? 'text-destructive'
            : remaining === 0
              ? 'text-muted-foreground'
              : 'text-foreground';

        return (
          <span className={`${color} ${textSizeStyle}`}>
            {remaining}
            {remaining < 0 && ' !!'}
          </span>
        );
      },
    },
    {
      id: 'sold to',
      accessorKey: 'vendors',
      header: ({ column }) => <TableColumnHeader column={column} title='Sold to' />,
      cell: ({ row }) => {
        const uniqueVendors = Array.from(new Set(row.original.vendors));
        const vendors =
          uniqueVendors.length > 2
            ? `${uniqueVendors.slice(0, 2).join(', ')}...`
            : uniqueVendors.join(', ');
        return (
          <abbr
            className={`no-underline ${textSizeStyle}`}
            title={uniqueVendors.join(', ')}
          >
            {vendors}
          </abbr>
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'cost',
      accessorKey: 'pricePerItem',
      header: ({ column }) => <TableColumnHeader column={column} title='Cost' />,
      cell: ({ row }) => (
        <PriceFieldContent
          className={textSizeStyle}
          value={row.original.pricePerItem * row.original.quantity}
          quantity={row.original.quantity}
        />
      ),
      sortingFn: (rowA, rowB) => {
        const totalA = rowA.original.quantity * rowA.original.pricePerItem;
        const totalB = rowB.original.quantity * rowB.original.pricePerItem;
        return totalA > totalB ? 1 : totalA < totalB ? -1 : 0;
      },
    },
    {
      id: 'sale price',
      accessorKey: 'soldQuantity',
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Sale Price' />
      ),
      cell: ({ row }) => (
        <PriceFieldContent
          className={textSizeStyle}
          value={row.original.currentSalePrice * row.original.soldQuantity}
          quantity={row.original.soldQuantity}
        />
      ),
      sortingFn: (rowA, rowB) => {
        const totalA = rowA.original.soldQuantity * rowA.original.currentSalePrice;
        const totalB = rowB.original.soldQuantity * rowB.original.currentSalePrice;
        return totalA > totalB ? 1 : totalA < totalB ? -1 : 0;
      },
    },
    {
      id: 'amount paid',
      accessorKey: 'amountPaid',
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Amount Paid' />
      ),
      cell: ({ row }) => {
        const cost = row.original.pricePerItem * row.original.quantity;
        const percentPaid = row.original.amountPaid / cost;
        const color =
          percentPaid === 0
            ? 'text-destructive'
            : percentPaid < 1
              ? 'text-warning'
              : 'text-success';
        return (
          <PriceFieldContent
            className={`${color} ${textSizeStyle}`}
            value={row.original.amountPaid}
          />
        );
      },
      sortingFn: (rowA, rowB) => rowA.original.amountPaid - rowB.original.amountPaid,
    },
    {
      id: 'amount due',
      accessorKey: 'debt',
      header: ({ column }) => <TableColumnHeader column={column} title='Amount Due' />,
      cell: ({ row }) => {
        const cost = row.original.pricePerItem * row.original.quantity;
        const due = Math.max(cost - row.original.amountPaid, 0);
        return (
          <PriceFieldContent
            className={`${due > 0 ? 'text-warning' : 'text-muted-foreground'} ${textSizeStyle}`}
            value={due}
          />
        );
      },
      sortingFn: (rowA, rowB) => {
        const costA = rowA.original.pricePerItem * rowA.original.quantity;
        const costB = rowB.original.pricePerItem * rowB.original.quantity;
        const dueA = Math.max(costA - rowA.original.amountPaid, 0);
        const dueB = Math.max(costB - rowB.original.amountPaid, 0);
        return dueA - dueB;
      },
    },
    {
      id: 'profit',
      accessorKey: 'profit',
      header: ({ column }) => <TableColumnHeader column={column} title='Profit' />,
      cell: ({ row }) => {
        const color =
          row.original.profit < 0
            ? 'text-destructive'
            : row.original.profit > 0
              ? 'text-success'
              : 'text-foreground';
        return (
          <PriceFieldContent
            className={`${color} ${textSizeStyle}`}
            value={row.original.profit}
            quantity={row.original.quantity}
          />
        );
      },
      sortingFn: (rowA, rowB) => rowA.original.profit - rowB.original.profit,
    },
    {
      id: 'last modified by',
      accessorKey: 'lastModifiedBy',
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Last Modified By' />
      ),
      cell: ({ row }) => <span className={textSizeStyle}>{row.original.lastModifiedBy}</span>,
    },
    {
      id: 'last modified',
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
      cell: ({ row }) => <OrderActionsCell order={row.original} deleteOrder={deleteOrder} />,
    },
  ];
}

function compareNullableDate(a: string | null, b: string | null) {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  return new Date(a).getTime() - new Date(b).getTime();
}

function OrderActionsCell({
  order,
  deleteOrder,
}: {
  order: OrderResponse;
  deleteOrder: DeleteOrder;
}) {
  const deleteDisclosure = useDisclosure();
  const editDisclosure = useDisclosure();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className='hover:bg-foreground/20 focus:bg-foreground/20'
          asChild
        >
          <Button
            data-testid='items-actions-button'
            variant='ghost'
            className='h-8 w-8 p-0'
            disabled={deleteOrder.isPending}
          >
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            data-testid='items-edit-button'
            className='text-warning focus:cursor-pointer focus:bg-foreground/20 focus:text-warning'
            onSelect={editDisclosure.onOpen}
            disabled={deleteOrder.isPending}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            data-testid='items-delete-button'
            className='text-destructive focus:cursor-pointer focus:bg-foreground/20 focus:text-destructive'
            onSelect={deleteDisclosure.onOpen}
            disabled={deleteOrder.isPending}
          >
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem
            data-testid='items-view-sales-button'
            className='text-primary focus:cursor-pointer focus:bg-foreground/20 focus:text-primary'
            asChild
            disabled={deleteOrder.isPending}
          >
            <Link href={`${APP_ITEMS}/${order.locationId}/${order.id}`}>View Sale</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteModal
        params={{ orderId: order.id }}
        disclosure={deleteDisclosure}
        mutation={deleteOrder}
      />
      <Modal
        className='flex w-full'
        size='5xl'
        isOpen={editDisclosure.isOpen}
        onClose={editDisclosure.onClose}
        placement='center'
        hideCloseButton
      >
        <CreateOrderForm
          locationId={order.locationId.toString()}
          orderId={order.id.toString()}
          onClose={editDisclosure.onClose}
        />
      </Modal>
    </>
  );
}
