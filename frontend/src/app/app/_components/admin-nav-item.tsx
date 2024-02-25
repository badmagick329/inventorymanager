import { APP_MANAGE_LOCATIONS, APP_MANAGE_USERS } from '@/consts/urls';
import {
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@nextui-org/react';

import { useAdminStatus } from '@/app/context/adminProvider';

export default function AdminNavItem() {
  const isAdmin = useAdminStatus();
  if (!isAdmin) {
    return null;
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          className='rounded-md border-secondary-500 p-2'
          color='secondary'
          variant='bordered'
        >
          Admin
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label='Admin Actions'>
        <DropdownItem
          className='text-secondary-500'
          key='users'
          as={Link}
          href={APP_MANAGE_USERS}
        >
          Users
        </DropdownItem>
        <DropdownItem
          className='text-secondary-500'
          key='locations'
          as={Link}
          href={APP_MANAGE_LOCATIONS}
        >
          Locations
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
