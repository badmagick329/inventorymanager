'use client';

import { useMemo, useState } from 'react';
import { ColumnFiltersState } from '@tanstack/react-table';

import { OrderResponse } from '@/types';
import { usePersistedTableState } from '@/app/app/items/_table/usePersistedTableState';
import { BaseTableState } from '@/app/app/items/_table/types';

type OrdersTableState = BaseTableState & {
  hideFullyPaid: boolean;
};

const defaultState: OrdersTableState = {
  sorting: [],
  columnVisibility: {},
  pageSize: 10,
  pageIndex: 0,
  hideFullyPaid: false,
};

export function useOrdersTableModel(locationId: string, orders: OrderResponse[]) {
  const [tableState, setTableState] = usePersistedTableState<OrdersTableState>(
    `items/${locationId}/tableState`,
    defaultState
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const filteredOrders = useMemo(() => {
    if (!tableState.hideFullyPaid) {
      return orders;
    }
    return orders.filter((order) => {
      const cost = order.pricePerItem * order.quantity;
      const due = Math.max(cost - order.amountPaid, 0);
      return due > 0;
    });
  }, [orders, tableState.hideFullyPaid]);

  return {
    tableState,
    setTableState,
    columnFilters,
    setColumnFilters,
    filteredOrders,
  };
}

