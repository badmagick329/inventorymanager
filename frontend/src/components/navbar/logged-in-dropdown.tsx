'use client';

import {
  useAdminStatus,
  useUsername,
} from '@/app/context/global-context-provider';
import { ICON_SM } from '@/consts';
import {
  APP_CHANGE_PASSWORD,
  APP_LOCATIONS,
  APP_MANAGE_LOCATIONS,
  APP_MANAGE_USERS,
} from '@/consts/urls';
import { useLogout } from '@/hooks';
import { ColorType, VariantType } from '@/types';
import {
  Button,
  Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Skeleton,
} from '@heroui/react';
import { KeyRound, LogOut, User, Warehouse } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function LoggedInDropdown() {
  const logout = useLogout();
  const username = useUsername();
  const isAdmin = useAdminStatus();
  if (username === '') {
    return null;
  }
  if (username === null) {
    return (
      <Card className='flex min-h-[38px] min-w-[160px] flex-row items-center justify-around gap-4'>
        <Skeleton className='flex rounded-lg'>
          <div className='h-3 min-w-[100px] rounded-lg bg-default-200'></div>
        </Skeleton>
      </Card>
    );
  }
  const userButtonColor = isAdmin ? 'secondary' : 'default';
  const items = getDropdownItems(isAdmin, logout.mutate);

  return (
    <Dropdown isDisabled={logout.isPending}>
      <DropdownTrigger>
        <Button
          color={userButtonColor}
          className='rounded-md p-2 font-semibold'
          radius='sm'
          variant='bordered'
        >
          <User size={ICON_SM} />
          <span data-testid='navbar-logged-in-as'>Logged in as {username}</span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label='User Actions' items={items}>
        {items.map((item) => {
          const { key, ...rest } = item;
          return <DropdownItem key={key} {...rest} />;
        })}
      </DropdownMenu>
    </Dropdown>
  );
}

type ItemType = {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  color?: ColorType;
  href?: string;
  key: string;
  onPress?: () => void;
  startContent?: React.ReactNode;
  variant?: VariantType;
  'data-testid'?: string;
};

function getDropdownItems(isAdmin: boolean | null, logout: () => void) {
  let items: ItemType[] = [
    {
      children: <Link href={APP_LOCATIONS}>Locations</Link>,
      className: 'text-foreground',
      color: 'default' as ColorType,
      key: 'locations',
      startContent: <Warehouse size={ICON_SM} />,
      'data-testid': 'navbar-dropdown-locations',
    },
    {
      children: <Link href={APP_CHANGE_PASSWORD}>Change password</Link>,
      className: 'text-foreground',
      color: 'default' as ColorType,
      key: 'change-password',
      startContent: <KeyRound size={ICON_SM} />,
      'data-testid': 'navbar-dropdown-change-password',
    },
    {
      children: 'Logout',
      color: 'danger' as ColorType,
      key: 'logout',
      onPress: logout,
      startContent: <LogOut size={ICON_SM} />,
      variant: 'solid' as VariantType,
      'data-testid': 'navbar-dropdown-logout',
    },
  ];
  if (isAdmin) {
    items.unshift(
      {
        children: <Link href={APP_MANAGE_LOCATIONS}>Manage Locations</Link>,
        className: 'text-secondary-500',
        key: 'manage-locations',
        startContent: <Warehouse size={ICON_SM} />,
        'data-testid': 'navbar-dropdown-manage-locations',
      },
      {
        children: <Link href={APP_MANAGE_USERS}>Manage Users</Link>,
        className: 'text-secondary-500',
        key: 'manage-users',
        startContent: <User size={ICON_SM} />,
        'data-testid': 'navbar-dropdown-manage-users',
      }
    );
  }
  return items;
}
