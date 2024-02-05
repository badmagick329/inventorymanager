import { ServerCrash } from 'lucide-react';
import { ICON_MD } from '@/consts';

export function ConnectionError({ message }: { message?: string }) {
  message = message ?? 'Could not connect to the server';
  return (
    <div className='flex justify-center items-center text-danger-600'>
      <ServerCrash size={ICON_MD} />
      <span className='text-2xl font-semibold p-4'> {message}</span>
    </div>
  );
}
