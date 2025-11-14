'use client';

import { ICON_SM } from '@/consts';
import { Button, Switch } from '@heroui/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggler() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button color='default' variant='flat' isIconOnly radius='sm'></Button>
    );
  }

  function getThumbIcon(isSelected: boolean, className: string) {
    if (isSelected) {
      return <Moon className={className} size={ICON_SM} />;
    } else {
      return <Sun className={className} size={ICON_SM} />;
    }
  }

  return (
    <Switch
      size='md'
      color='default'
      isSelected={theme === 'dark'}
      thumbIcon={({ isSelected, className }) =>
        getThumbIcon(isSelected, className)
      }
      onValueChange={(isSelected) =>
        isSelected ? setTheme('dark') : setTheme('light')
      }
    ></Switch>
  );
}
