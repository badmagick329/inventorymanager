import { APP_LOCATIONS } from '@/consts/urls';
import { Button, Link } from '@heroui/react';
import Image from 'next/image';

import WarehouseImage from '../../../public/images/warehouse-sm.png';

export default function LocationsNavItem() {
  return (
    <>
      <Button
        as={Link}
        href={APP_LOCATIONS}
        className='rounded-md border-foreground/80 p-2 hover:bg-foreground/20'
        variant='bordered'
        radius='sm'
      >
        <Image
          width={30}
          height={30}
          src={WarehouseImage}
          alt='Warehouse'
          unoptimized
        />
        <span data-testid='navbar-home'>Home</span>
      </Button>
    </>
  );
}
