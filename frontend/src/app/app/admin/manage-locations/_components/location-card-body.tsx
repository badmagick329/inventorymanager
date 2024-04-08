import { ICON_MD } from '@/consts';
import { APP_MANAGE_USERS } from '@/consts/urls';
import { Link } from '@nextui-org/react';
import { User } from 'lucide-react';

export default function LocationCardBody({ users }: { users: string[] }) {
  return (
    <>
      <ul className='flex flex-wrap justify-center gap-8'>
        {users.map((user: string) => {
          return (
            <div key={user} className='flex gap-2'>
              <User className='pb-1' size={ICON_MD} />
              <span data-testid='manage-locations-username'>{user}</span>
            </div>
          );
        })}
      </ul>
      {users.length === 0 && (
        <div className='flex w-full justify-center gap-2'>
          <span>No users assigned. </span>
          <Link
            color='foreground'
            href={APP_MANAGE_USERS}
            className='underline'
          >
            Create new user?
          </Link>
        </div>
      )}
    </>
  );
}
