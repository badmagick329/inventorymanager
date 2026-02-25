'use client';

import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { TanStackTable } from '@/app/app/items/_table/TanStackTable';
import { usePersistedTableState } from '@/app/app/items/_table/usePersistedTableState';
import { BaseTableState } from '@/app/app/items/_table/types';
import { DeleteSale, SaleResponse } from '@/types';
import { SalesTableToolbar } from './toolbar';
import { getSalesColumns } from './columns';

const defaultState: BaseTableState = {
  sorting: [],
  columnVisibility: {},
  pageSize: 10,
  pageIndex: 0,
};

export function SalesTanStackTable({
  locationId,
  orderId,
  sales,
  deleteSale,
}: {
  locationId: string;
  orderId: string;
  sales: SaleResponse[];
  deleteSale: DeleteSale;
}) {
  const [tableState, setTableState] = usePersistedTableState<BaseTableState>(
    `items/${locationId}/order/${orderId}/salesTableState`,
    defaultState
  );

  const table = useReactTable({
    data: sales,
    columns: getSalesColumns({ locationId, orderId, deleteSale }),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => {
      const sorting =
        typeof updater === 'function' ? updater(tableState.sorting) : updater;
      setTableState({ ...tableState, sorting });
    },
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
      columnVisibility: tableState.columnVisibility,
      pagination: {
        pageIndex: tableState.pageIndex,
        pageSize: tableState.pageSize,
      },
    },
  });

  return (
    <div>
      <SalesTableToolbar table={table} />
      <TanStackTable
        table={table}
        tableTestId='sales-table'
        rowTestId='sales-table-row'
        emptyMessage='No sales added'
      />
    </div>
  );
}

