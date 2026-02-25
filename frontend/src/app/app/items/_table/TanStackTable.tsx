import { flexRender, Table } from '@tanstack/react-table';

import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TablePagination } from './pagination';

type TanStackTableProps<TData> = {
  table: Table<TData>;
  tableTestId: string;
  rowTestId: string;
  emptyMessage: string;
};

export function TanStackTable<TData>({
  table,
  tableTestId,
  rowTestId,
  emptyMessage,
}: TanStackTableProps<TData>) {
  return (
    <div className='overflow-hidden rounded-md border'>
      <UiTable data-testid={tableTestId}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-testid={rowTestId}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllLeafColumns().length} className='h-24 text-center'>
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </UiTable>
      <TablePagination table={table} />
    </div>
  );
}

