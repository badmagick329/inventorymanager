import { ICON_MD } from '@/consts';
import { APP_MANAGE_USERS } from '@/consts/urls';
import { Link } from "@heroui/react";
import { User } from 'lucide-react';

export default function LocationCardBody({ users }: { users: string[] }) {
  return (
    <>
      <ul className='flex flex-wrap gap-2'>
        {users.map((user: string) => {
          return (
            <li
              key={user}
              className='flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm'
            >
              <User className='pb-1' size={ICON_MD} />
              <span data-testid='manage-locations-username'>{user}</span>
            </li>
          );
        })}
      </ul>
      {users.length === 0 && (
        <div className='flex w-full flex-col items-start gap-2 text-sm text-muted-foreground'>
          <span>No users assigned.</span>
          <Link
            color='primary'
            href={APP_MANAGE_USERS}
            className='text-sm'
          >
            Manage users
          </Link>
        </div>
      )}
    </>
  );
}
