import { ICON_MD } from '@/consts';
import { APP_ITEMS, APP_MANAGE_LOCATIONS } from '@/consts/urls';
import { Location } from '@/types';
import { Warehouse } from 'lucide-react';
import Link from 'next/link';

export default function LocationList({ locations }: { locations: Location[] }) {
  return (
    <>
      <div className='flex flex-wrap gap-2'>
        {locations.map((location) => (
          <Link
            color='foreground'
            href={`${APP_ITEMS}/${location.id}`}
            key={location.id}
            className='flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-foreground'
          >
            <Warehouse className='pb-1' size={ICON_MD} />
            <p key={location.name}>
              {location.name}
            </p>
          </Link>
        ))}
        {locations.length === 0 && (
          <Link
            color='foreground'
            href={APP_MANAGE_LOCATIONS}
            className='text-sm text-primary'
          >
            Assign Locations
          </Link>
        )}
      </div>
    </>
  );
}
