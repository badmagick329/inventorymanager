'use client';

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { DeleteOrder, OrderResponse } from '@/types';
import { TanStackTable } from '@/app/app/items/_table/TanStackTable';
import { getOrderColumns } from './columns';
import { OrdersTableToolbar } from './toolbar';
import { useOrdersTableModel } from './useOrdersTableModel';

export function OrdersTanStackTable({
  locationId,
  orders,
  deleteOrder,
}: {
  locationId: string;
  orders: OrderResponse[];
  deleteOrder: DeleteOrder;
}) {
  const {
    tableState,
    setTableState,
    columnFilters,
    setColumnFilters,
    filteredOrders,
  } = useOrdersTableModel(locationId, orders);

  const table = useReactTable({
    data: filteredOrders,
    columns: getOrderColumns(deleteOrder),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => {
      const sorting =
        typeof updater === 'function' ? updater(tableState.sorting) : updater;
      setTableState({ ...tableState, sorting });
    },
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: (updater) => {
      const columnVisibility =
        typeof updater === 'function'
          ? updater(tableState.columnVisibility)
          : updater;
      setTableState({ ...tableState, columnVisibility });
    },
    onPaginationChange: (updater) => {
      const current = {
        pageIndex: tableState.pageIndex,
        pageSize: tableState.pageSize,
      };
      const pagination = typeof updater === 'function' ? updater(current) : updater;
      setTableState({
        ...tableState,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
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
      <OrdersTableToolbar
        table={table}
        hideFullyPaid={tableState.hideFullyPaid}
        onToggleHideFullyPaid={() =>
          setTableState({
            ...tableState,
            hideFullyPaid: !tableState.hideFullyPaid,
            pageIndex: 0,
          })
        }
      />
      <TanStackTable
        table={table}
        tableTestId='items-table'
        rowTestId='items-table-row'
        emptyMessage='No results.'
      />
    </div>
  );
}

