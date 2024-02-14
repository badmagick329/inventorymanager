import { APP_LOCATIONS } from '@/consts/urls';
import { Button, Link } from '@nextui-org/react';
import Image from 'next/image';
import WarehouseImage from '../../../../public/images/warehouse-sm.png';

export default function LocationsNavItem() {
  return (
    <>
      <Button
        className='rounded-md border-foreground-600 p-2'
        variant='bordered'
        as={Link}
        href={APP_LOCATIONS}
        isIconOnly
      >
        <Image
          width={30}
          height={30}
          src={WarehouseImage}
          alt='Warehouse'
          unoptimized
        />
      </Button>
    </>
  );
}
