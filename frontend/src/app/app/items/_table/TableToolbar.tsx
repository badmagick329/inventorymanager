import { ReactNode } from 'react';

export function TableToolbar({
  left,
  right,
}: {
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className='flex items-center py-4'>
      <div className='flex flex-1 items-center gap-2'>{left}</div>
      <div className='flex items-center'>{right}</div>
    </div>
  );
}

