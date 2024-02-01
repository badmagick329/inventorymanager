'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Paintbrush } from 'lucide-react';

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

  if (!mounted) {
    return <Button color='primary' variant='flat' isIconOnly></Button>;
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          className='rounded-md'
          color='primary'
          variant='flat'
          isIconOnly
        >
          <ThemeIcon theme={theme} />
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
          Purple
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

function ThemeIcon({ theme }: { theme: string | undefined }) {
  if (!theme) {
    return null;
  }
  switch (theme) {
    case 'light':
      return <Sun className='icon-sm' />;
    case 'dark':
      return <Moon className='icon-sm' />;
    case 'modern':
      return <Paintbrush className='icon-sm' />;
    default:
      return null;
  }
}
