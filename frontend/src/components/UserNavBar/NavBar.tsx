import React from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
} from '@nextui-org/react';
import Image from 'next/image';
import { ThemeSwitcher } from '@/components/UserNavBar/ThemeSwitcher';
import LogoutButton from '@/components/UserNavBar/LogoutButton';
import { useQueryClient } from '@tanstack/react-query';

export default function UserNavBar() {
  return (
    <Navbar>
      <NavbarContent className='flex gap-4' justify='start'>
        <NavbarBrand>
          <Link href='/'>
            <Image
              width={50}
              height={50}
              src='images/warehouse.png'
              alt='Picture of a warehouse'
              unoptimized
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>
      <AdminItems />
      <NavbarContent justify='end'>
        <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>
        <NavbarItem>
          <LogoutButton />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}

function AdminItems() {
  const queryClient = useQueryClient();
  if (!queryClient.getQueryData(['showAdmin'])) {
    return null;
  }
  return (
    <NavbarContent justify='center'>
      <NavbarItem>Something</NavbarItem>
      <NavbarItem>Something else</NavbarItem>
    </NavbarContent>
  );
}
