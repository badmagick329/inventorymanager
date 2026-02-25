import { Table } from '@tanstack/react-table';

import { TableToolbar } from '@/app/app/items/_table/TableToolbar';

export function SalesTableToolbar<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  // Keep toolbar minimal for now to preserve current sales page behavior.
  return <TableToolbar />;
}

