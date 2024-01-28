'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon, PaintBrushIcon } from '@heroicons/react/24/solid';

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@nextui-org/react';

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  function themeIcon() {
    switch (theme) {
      case 'light':
        return <SunIcon className='h-4 w-4' />;
      case 'dark':
        return <MoonIcon className='h-4 w-4' />;
      case 'modern':
        return <PaintBrushIcon className='h-4 w-4' />;
      default:
        return <SunIcon className='h-4 w-4' />;
    }
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button color='primary' variant='flat' isIconOnly>
          {themeIcon()}
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label='Switch Theme Actions'>
        <DropdownItem key='light' onClick={() => setTheme('light')}>
          Light
        </DropdownItem>
        <DropdownItem key='dark' onClick={() => setTheme('dark')}>
          Dark
        </DropdownItem>
        <DropdownItem key='modern' onClick={() => setTheme('modern')}>
          Modern
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
