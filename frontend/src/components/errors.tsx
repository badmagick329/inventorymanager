import { ServerCrash } from 'lucide-react';
import { ICON_MD } from '@/consts';

export function ConnectionError({ message }: { message?: string }) {
  message = message ?? 'Could not connect to the server';
  return (
    <div className='flex items-center justify-center text-danger-600'>
      <ServerCrash size={ICON_MD} />
      <span className='p-4 text-2xl font-semibold'> {message}</span>
    </div>
  );
}

export function GenericError({
  message,
  children,
}: {
  message?: string;
  children?: React.ReactNode;
}) {
  message = message ?? 'Could not connect to the server';
  return (
    <div className='mt-4 flex flex-col items-center justify-center'>
      {children}
      <span className='p-4 text-2xl font-semibold'> {message}</span>
    </div>
  );
}
