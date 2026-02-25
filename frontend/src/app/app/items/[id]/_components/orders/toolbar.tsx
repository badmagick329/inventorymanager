import { Table } from '@tanstack/react-table';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TableToolbar } from '@/app/app/items/_table/TableToolbar';
import { TableViewOptions } from '@/app/app/items/_table/view-options';

export function OrdersTableToolbar<TData>({
  table,
  hideFullyPaid,
  onToggleHideFullyPaid,
}: {
  table: Table<TData>;
  hideFullyPaid: boolean;
  onToggleHideFullyPaid: () => void;
}) {
  return (
    <TableToolbar
      left={
        <>
          <Input
            placeholder='Filter by name...'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className='max-w-sm text-xs sm:text-base'
          />
          <Button
            variant='outline'
            size='sm'
            onClick={onToggleHideFullyPaid}
            className='ml-2 hover:bg-foreground/20 focus:bg-foreground/20'
          >
            {hideFullyPaid ? 'Show Fully Paid' : 'Hide Fully Paid'}
          </Button>
        </>
      }
      right={<TableViewOptions table={table} />}
    />
  );
}

