'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
  getSortedRowModel,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from './data-table-pagination';
import { DataTableViewOptions } from './data-table-view-options';
import { useLocalStorage } from '@/hooks';
import { Button } from '@/components/ui/button';
import { OrderResponse } from '@/types';

type TableState = {
  sorting: SortingState;
  columnVisibility: VisibilityState;
  pageSize: number;
  pageIndex: number;
  hideFullyPaid: boolean;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  locationId: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  locationId,
}: DataTableProps<TData, TValue>) {
  const [tableState, setTableState] = useLocalStorage<TableState>(
    `items/${locationId}/tableState`,
    {
      sorting: [],
      columnVisibility: {},
      pageSize: 10,
      pageIndex: 0,
      hideFullyPaid: false,
    }
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Memoizing filtered data to prevent render loop
  const filteredData = useMemo(
    () =>
      (tableState.hideFullyPaid
        ? (data as OrderResponse[]).filter((row) => {
            const cost = row.pricePerItem * row.quantity;
            const due = Math.max(cost - row.amountPaid, 0);
            return due > 0;
          })
        : data) as TData[],
    [data, tableState.hideFullyPaid]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === 'function' ? updater(tableState.sorting) : updater;
      setTableState({ ...tableState, sorting: newSorting });
    },
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: (updater) => {
      const newVisibility =
        typeof updater === 'function'
          ? updater(tableState.columnVisibility)
          : updater;
      setTableState({ ...tableState, columnVisibility: newVisibility });
    },
    onPaginationChange: (updater) => {
      const currentPagination = {
        pageIndex: tableState.pageIndex,
        pageSize: tableState.pageSize,
      };
      const newPagination =
        typeof updater === 'function' ? updater(currentPagination) : updater;
      setTableState({
        ...tableState,
        pageSize: newPagination.pageSize,
        pageIndex: newPagination.pageIndex,
      });
    },
    state: {
      sorting: tableState.sorting,
      columnFilters,
      columnVisibility: tableState.columnVisibility,
      pagination: {
        pageIndex: tableState.pageIndex,
        pageSize: tableState.pageSize,
      },
    },
  });

  return (
    <div>
      <div className='flex items-center py-4'>
        <Input
          placeholder='Filter by name...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
        />
        <Button
          variant='outline'
          size='sm'
          onClick={() =>
            setTableState({
              ...tableState,
              hideFullyPaid: !tableState.hideFullyPaid,
              pageIndex: 0, // Reset to first page when toggling filter
            })
          }
          className='ml-2'
        >
          {tableState.hideFullyPaid ? 'Show Fully Paid' : 'Hide Fully Paid'}
        </Button>
        <DataTableViewOptions table={table} />
      </div>
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
