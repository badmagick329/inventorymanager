import React from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
} from '@nextui-org/react';
import Image from 'next/image';
import { ThemeSwitcher } from '@/app/components/ThemeSwitcher';
import LogoutButton from '@/app/components/LogoutButton';

export default function App() {
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
