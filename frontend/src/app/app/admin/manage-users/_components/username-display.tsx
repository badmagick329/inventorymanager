import { User } from 'lucide-react';
import { ICON_MD } from '@/consts';
export default function UsernameDisplay({ username }: { username: string }) {
  return (
    <>
      <User className='pb-1' size={ICON_MD} />
      <p className='font-semibold'>{username}</p>
    </>
  );
}
