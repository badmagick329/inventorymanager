import { APP_RECEIVABLES } from '@/consts/urls';
import { Button, Link } from '@heroui/react';
import { HandCoins } from 'lucide-react';

export default function ReceivablesNavItem() {
  return (
    <Button
      as={Link}
      href={APP_RECEIVABLES}
      className='rounded-md border-foreground/80 p-2 hover:bg-foreground/20'
      variant='bordered'
      radius='sm'
      startContent={<HandCoins size={18} />}
    >
      <span className='hidden sm:inline'>Receivables</span>
      <span className='sm:hidden'>Due</span>
    </Button>
  );
}
