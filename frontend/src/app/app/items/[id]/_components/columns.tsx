'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from './data-table-column-header';
import { DeleteOrder, OrderResponse } from '@/types';
import { PriceFieldContent } from '@/components';
import DeleteModal from '@/components/delete-modal';
import { Modal, useDisclosure } from '@heroui/react';
import { APP_ITEMS } from '@/consts/urls';
import Link from 'next/link';
import { CreateOrderForm } from '@/app/app/items/[id]/_components';

export const getColumns = (
  deleteOrder: DeleteOrder
): ColumnDef<OrderResponse>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Purchase Date' />
    ),
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Stock total' />
    ),
    cell: ({ row }) => {
      const color =
        row.original.soldQuantity === row.original.quantity
          ? 'text-muted-foreground'
          : 'text-foreground';
      return <span className={color}>{row.original.quantity}</span>;
    },
  },
  {
    accessorKey: 'soldQuantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Stock sold' />
    ),
    cell: ({ row }) => {
      const color =
        row.original.soldQuantity === row.original.quantity
          ? 'text-muted-foreground'
          : 'text-foreground';
      return <span className={color}>{row.original.soldQuantity}</span>;
    },
  },
  {
    id: 'remaining',
    accessorKey: 'quantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Stock remaining' />
    ),
    cell: ({ row }) => {
      const remaining = row.original.quantity - row.original.soldQuantity;
      let remainingColor = 'text-foreground';
      if (remaining < 0) {
        remainingColor = 'text-destructive';
      }
      if (remaining === 0) {
        remainingColor = 'text-muted-foreground';
      }

      return (
        <span className={remainingColor}>
          {remaining}
          {remaining < 0 && ' !!'}
        </span>
      );
    },
  },
  {
    accessorKey: 'vendors',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sold to' />
    ),
    cell: ({ row }) => {
      const uniqueVendors = [] as string[];
      row.original.vendors.forEach((vendor) => {
        if (!uniqueVendors.includes(vendor)) {
          uniqueVendors.push(vendor);
        }
      });
      const vendors =
        uniqueVendors.length > 2
          ? `${uniqueVendors.slice(0, 2).join(', ')}...`
          : uniqueVendors.join(', ');
      return (
        <abbr className='no-underline' title={`${uniqueVendors.join(', ')}`}>
          {vendors}
        </abbr>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'pricePerItem',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cost' />
    ),
    cell: ({ row }) => {
      const quantity = row.original.quantity;
      const pricePerItem = row.original.pricePerItem;
      return (
        <PriceFieldContent
          value={pricePerItem * quantity}
          quantity={quantity}
        />
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const quantityA = rowA.original.quantity;
      const pricePerItemA = rowA.original.pricePerItem;
      const totalA = quantityA * pricePerItemA;
      const quantityB = rowB.original.quantity;
      const pricePerItemB = rowB.original.pricePerItem;
      const totalB = quantityB * pricePerItemB;
      return totalA > totalB ? 1 : totalA < totalB ? -1 : 0;
    },
  },
  {
    id: 'salePrice',
    accessorKey: 'soldQuantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sale Price' />
    ),
    cell: ({ row }) => {
      const quantity = row.original.soldQuantity;
      const pricePerItem = row.original.currentSalePrice;

      return (
        <PriceFieldContent
          value={pricePerItem * quantity}
          quantity={quantity}
        />
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const quantityA = rowA.original.soldQuantity;
      const pricePerItemA = rowA.original.currentSalePrice;
      const totalA = quantityA * pricePerItemA;
      const quantityB = rowB.original.soldQuantity;
      const pricePerItemB = rowB.original.currentSalePrice;
      const totalB = quantityB * pricePerItemB;
      return totalA > totalB ? 1 : totalA < totalB ? -1 : 0;
    },
  },
  {
    accessorKey: 'amountPaid',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount Paid' />
    ),
    cell: ({ row }) => {
      const cost = row.original.pricePerItem * row.original.quantity;
      const percentPaid = row.original.amountPaid / cost;
      let color = 'text-success';
      if (percentPaid < 1) {
        color = 'text-warning';
      }
      return (
        <PriceFieldContent className={color} value={row.original.amountPaid} />
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      return rowA.original.amountPaid - rowB.original.amountPaid;
    },
  },
  {
    accessorKey: 'debt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount Due' />
    ),
    cell: ({ row }) => {
      const cost = row.original.pricePerItem * row.original.quantity;
      const due = Math.max(cost - row.original.amountPaid, 0);
      const color = due > 0 ? 'text-warning' : 'text-muted-foreground';
      return <PriceFieldContent className={color} value={due} />;
    },
    sortingFn: (rowA, rowB, columnId) => {
      return rowA.original.debt - rowB.original.debt;
    },
  },
  {
    accessorKey: 'profit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Profit' />
    ),
    cell: ({ row }) => {
      let profitColor = 'text-foreground';
      if (row.original.profit < 0) {
        profitColor = 'text-destructive';
      }
      if (row.original.profit > 0) {
        profitColor = 'text-success';
      }

      return (
        <PriceFieldContent
          className={profitColor}
          value={row.original.profit}
          quantity={row.original.quantity}
        />
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      return rowA.original.profit - rowB.original.profit;
    },
  },
  {
    accessorKey: 'lastModifiedBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Last Modified By' />
    ),
  },
  {
    accessorKey: 'lastModified',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Last Modified' />
    ),
    cell: ({ row }) => {
      return (
        <span>{new Date(row.original.lastModified).toLocaleString()}</span>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      return (
        new Date(rowA.original.lastModified).getTime() -
        new Date(rowB.original.lastModified).getTime()
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original;
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
                className='text-warning focus:cursor-pointer focus:bg-foreground/20 focus:text-warning'
                onSelect={editDisclosure.onOpen}
                disabled={deleteOrder.isPending}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className='text-destructive focus:cursor-pointer focus:bg-foreground/20 focus:text-destructive'
                onSelect={deleteDisclosure.onOpen}
                disabled={deleteOrder.isPending}
              >
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem
                className='text-primary focus:cursor-pointer focus:bg-foreground/20 focus:text-primary'
                asChild
                disabled={deleteOrder.isPending}
              >
                <Link href={`${APP_ITEMS}/${order.locationId}/${order.id}`}>
                  View Sale
                </Link>
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
            size={'5xl'}
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
    },
  },
];
