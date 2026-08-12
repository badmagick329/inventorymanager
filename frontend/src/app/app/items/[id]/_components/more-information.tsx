import { Location } from '@/types';

import { LocationInformationCard, VendorsInformationCard } from '.';

export default function MoreInformation({
  detailsHidden,
  location,
}: {
  detailsHidden: boolean;
  location?: Location;
}) {
  return (
    <div className='flex w-full flex-col gap-4'>
      <LocationInformationCard
        revenue={location?.revenue}
        spendings={location?.spendings}
        profit={location?.profit}
        debt={location?.debt}
      />
      {!detailsHidden && <VendorsInformationCard locationId={location?.id} />}
    </div>
  );
}
