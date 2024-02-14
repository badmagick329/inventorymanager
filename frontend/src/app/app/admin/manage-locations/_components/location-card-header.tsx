import { ICON_MD } from '@/consts';
import { APP_ITEMS } from '@/consts/urls';
import { Link } from '@nextui-org/react';
import { Warehouse } from 'lucide-react';

export default function LocationCardHeader({
  name,
  locationId,
}: {
  name: string;
  locationId: number;
}) {
  return (
    <>
      <Warehouse className='pb-1' size={ICON_MD} />
      <Link
        color='foreground'
        className='font-semibold'
        href={`${APP_ITEMS}/${locationId}`}
      >
        {name}
      </Link>
    </>
  );
}
