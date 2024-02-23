import { Location, OrderResponse } from '@/types';
import LocationInformationCard from './location-information-card';
import VendorsInformationCard from './vendor-information-card';

export default function MoreInformation({
  detailsHidden,
  location,
}: {
  detailsHidden: boolean;
  orders: OrderResponse[];
  location?: Location;
}) {
  if (detailsHidden) {
    return null;
  }

  return (
    <div className='flex w-full justify-center gap-4 flex-wrap'>
      <LocationInformationCard
        revenue={location?.revenue}
        spendings={location?.spendings}
        profit={location?.profit}
      />
      <VendorsInformationCard locationId={location?.id} />
    </div>
  );
}
