'use client';
import { User, LogOut, KeyRound, Warehouse } from 'lucide-react';
import { ICON_SM } from '@/consts';
import {
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Skeleton,
  Card,
} from '@nextui-org/react';
import { useLogout } from '@/hooks';
import { APP_CHANGE_PASSWORD, APP_LOCATIONS } from '@/consts/urls';
import { useAdminStatus, useUsername } from '@/app/context/admin-provider';
import { APP_MANAGE_LOCATIONS, APP_MANAGE_USERS } from '@/consts/urls';
import { ColorType, VariantType } from '@/types';

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
          <span>Logged in as {username}</span>
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

function getDropdownItems(isAdmin: boolean | null, logout: () => void) {
  type ItemType = {
    as?: React.ElementType;
    children: string;
    className?: string;
    color?: ColorType;
    href?: string;
    key: string;
    onPress?: () => void;
    startContent?: React.ReactNode;
    variant?: VariantType;
  };
  let items: ItemType[] = [
    {
      as: Link,
      children: 'Locations',
      className: 'text-foreground',
      color: 'default' as ColorType,
      href: APP_LOCATIONS,
      key: 'locations',
      startContent: <Warehouse size={ICON_SM} />,
    },
    {
      as: Link,
      children: 'Change password',
      className: 'text-foreground',
      color: 'default' as ColorType,
      href: APP_CHANGE_PASSWORD,
      key: 'change-password',
      startContent: <KeyRound size={ICON_SM} />,
    },
    {
      children: 'Logout',
      color: 'danger' as ColorType,
      key: 'logout',
      onPress: logout,
      startContent: <LogOut size={ICON_SM} />,
      variant: 'solid' as VariantType,
    },
  ];
  if (isAdmin) {
    items.unshift(
      {
        as: Link,
        children: 'Manage Locations',
        className: 'text-secondary-500',
        href: APP_MANAGE_LOCATIONS,
        key: 'manage-locations',
        startContent: <Warehouse size={ICON_SM} />,
      },
      {
        as: Link,
        children: 'Manage Users',
        className: 'text-secondary-500',
        href: APP_MANAGE_USERS,
        key: 'manage-users',
        startContent: <User size={ICON_SM} />,
      }
    );
  }
  return items;
}
