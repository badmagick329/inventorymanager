'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

import { Button, Switch } from '@nextui-org/react';

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Button color='primary' variant='flat' isIconOnly></Button>;
  }

  return (
    <Switch
      defaultSelected
      size='lg'
      color='default'
      onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      thumbIcon={({ isSelected, className }) =>
        isSelected ? (
          <Moon className={className} />
        ) : (
          <Sun className={className} />
        )
      }
    ></Switch>
  );
}
