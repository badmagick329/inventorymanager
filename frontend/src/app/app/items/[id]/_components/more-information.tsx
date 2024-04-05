import { Location } from '@/types';

import { LocationInformationCard, VendorsInformationCard } from '.';

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
