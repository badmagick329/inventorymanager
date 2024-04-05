import { ICON_MD } from '@/consts';
import { User } from 'lucide-react';

export default function UsernameDisplay({ username }: { username: string }) {
  return (
    <>
      <User className='pb-1' size={ICON_MD} />
      <p className='font-semibold'>{username}</p>
    </>
  );
}
