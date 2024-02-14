'use client';

import { useEffect, useState } from 'react';
import { Switch, Button } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { ICON_SM } from '@/consts';

export default function ThemeToggler() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Button color='default' variant='flat' isIconOnly></Button>;
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
      size='lg'
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
