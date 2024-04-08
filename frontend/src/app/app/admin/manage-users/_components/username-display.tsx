import { ICON_MD } from '@/consts';
import { User } from 'lucide-react';

export default function UsernameDisplay({ username }: { username: string }) {
  return (
    <>
      <User className='pb-1' size={ICON_MD} />
      <p data-testid='manage-users-user-title' className='font-semibold'>
        {username}
      </p>
    </>
  );
}
