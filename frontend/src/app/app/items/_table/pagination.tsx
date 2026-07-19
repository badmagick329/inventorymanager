import { Table } from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TablePaginationProps<TData> {
  table: Table<TData>;
}

export function TablePagination<TData>({ table }: TablePaginationProps<TData>) {
  return (
    <div className='flex items-center justify-between space-x-6 p-2 lg:space-x-8'>
      <div className='flex items-center space-x-2'>
        <p className='text-sm font-medium'>Rows per page</p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger
            data-testid='table-rows-per-page'
            className='h-8 w-[70px] hover:bg-foreground/20 focus:bg-foreground/20'
          >
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side='top'>
            {[5, 10, 20, 25, 30, 40, 50].map((pageSize) => (
              <SelectItem
                key={pageSize}
                value={`${pageSize}`}
                data-testid={`table-page-size-${pageSize}`}
                className='hover:bg-foreground/20 focus:bg-foreground/20'
              >
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div
        data-testid='table-page-status'
        className='flex w-[100px] items-center justify-center text-sm font-medium'
      >
        Page {table.getState().pagination.pageIndex + 1} of{' '}
        {table.getPageCount()}
      </div>
      <div className='flex items-center space-x-2'>
        <Button
          data-testid='table-first-page'
          variant='outline'
          size='icon'
          className='hidden size-8 hover:bg-foreground/20 focus:bg-foreground/20 lg:flex'
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span className='sr-only'>Go to first page</span>
          <ChevronsLeft />
        </Button>
        <Button
          data-testid='table-previous-page'
          variant='outline'
          size='icon'
          className='size-8 hover:bg-foreground/20 focus:bg-foreground/20'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span className='sr-only'>Go to previous page</span>
          <ChevronLeft />
        </Button>
        <Button
          data-testid='table-next-page'
          variant='outline'
          size='icon'
          className='size-8 hover:bg-foreground/20 focus:bg-foreground/20'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className='sr-only'>Go to next page</span>
          <ChevronRight />
        </Button>
        <Button
          data-testid='table-last-page'
          variant='outline'
          size='icon'
          className='hidden size-8 hover:bg-foreground/20 focus:bg-foreground/20 lg:flex'
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <span className='sr-only'>Go to last page</span>
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
