import { Location, OrderResponse } from '@/types';
import LocationInformationCard from './location-information-card';
import VendorsInformationCard from './vendor-information-card';

export default function MoreInformation({
  detailsHidden,
  location,
}: {
  detailsHidden: boolean;
  location?: Location;
}) {
  if (detailsHidden) {
    return null;
  }

  return (
    <div className='flex w-full flex-wrap justify-center gap-4'>
      <LocationInformationCard
        revenue={location?.revenue}
        spendings={location?.spendings}
        profit={location?.profit}
      />
      <VendorsInformationCard locationId={location?.id} />
    </div>
  );
}
