import { SortingState, VisibilityState } from '@tanstack/react-table';

export type BaseTableState = {
  sorting: SortingState;
  columnVisibility: VisibilityState;
  pageSize: number;
  pageIndex: number;
};

