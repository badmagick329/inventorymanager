import { Location } from '@/types';
import { APP_ITEMS, APP_MANAGE_LOCATIONS } from '@/consts/urls';
import Link from 'next/link';
import { ICON_MD } from '@/consts';
import { Warehouse } from 'lucide-react';

export default function LocationList({ locations }: { locations: Location[] }) {
  return (
    <>
      <div className='flex flex-col items-start gap-4'>
        {locations.map((location) => (
          <Link
            color='foreground'
            href={`${APP_ITEMS}/${location.id}`}
            key={location.id}
            className='flex justify-start gap-2 pr-4'
          >
            <Warehouse className='pb-1' size={ICON_MD} />
            <p className='text-center' key={location.name}>
              {location.name}
            </p>
          </Link>
        ))}
        {locations.length === 0 && (
          <Link
            color='foreground'
            href={APP_MANAGE_LOCATIONS}
            className='text-md md:text-semibold flex w-full justify-center underline md:text-base'
          >
            Assign Locations
          </Link>
        )}
      </div>
    </>
  );
}
