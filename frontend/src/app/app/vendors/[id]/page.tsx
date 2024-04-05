'use client';
import { useVendors } from '@/hooks';
import { usePathname, useRouter } from 'next/navigation';
import OptionalErrorElement from '@/components/optional-error-element';
import { APP_ITEMS, APP_LOGIN } from '@/consts/urls';
import { Button, Divider, Link } from '@nextui-org/react';
import { VendorResponse } from '@/types';
import VendorForm from './_components/vendor-form';
import { Spinner } from '@/components/loaders';

export default function LocationVendors() {
  const locationId = usePathname().split('/')[3];
  const router = useRouter();

  const { error, isError, isLoading, data: vendors } = useVendors(locationId);
  if (isError) {
    const comp = <OptionalErrorElement errorMessage={error.message} />;
    if (comp) {
      return comp;
    } else {
      router.push(APP_LOGIN);
    }
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (!vendors) {
    return null;
  }

  return (
    <div className='flex w-full flex-col items-center gap-4 pt-6'>
      <span className='text-2xl font-black'>Manage Vendors</span>
      <Button
        as={Link}
        href={`${APP_ITEMS}/${locationId}`}
        variant='flat'
        radius='sm'
        color='default'
        showAnchorIcon
      >
        Back to Items
      </Button>
      {vendors.map((vendor: VendorResponse, idx: number) => (
        <div key={vendor.name} className='flex w-full flex-col items-center'>
          <VendorForm vendor={vendor} locationId={locationId} />
          {idx !== vendors.length - 1 && (
            <Divider className='my-6 w-full px-6 md:w-2/3' />
          )}
        </div>
      ))}
      {vendors.length === 0 && (
        <div className='text-2xl font-semibold pt-4'>
          No vendors found for this location
        </div>
      )}
    </div>
  );
}
