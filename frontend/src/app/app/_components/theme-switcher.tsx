'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@nextui-org/react';

export default function ThemeSwitcher() {
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
          className='rounded-md border-foreground-600'
          color='default'
          variant='bordered'
          isIconOnly
        >
          <ThemeIcon theme={theme} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label='Switch Theme Actions'>
        <DropdownItem key='light' onPress={() => setTheme('light')}>
          Light
        </DropdownItem>
        <DropdownItem key='dark' onPress={() => setTheme('dark')}>
          Dark
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

function ThemeIcon({ theme }: { theme: string | undefined }) {
  if (!theme) {
    return null;
  }
  if (theme === 'light') {
    return <Sun className='icon-sm' />;
  }
  return <Moon className='icon-sm' />;
}
