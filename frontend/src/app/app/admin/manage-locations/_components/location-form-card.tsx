import LocationForm from './location-form';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
} from '@nextui-org/react';

import { useQueryClient } from '@tanstack/react-query';

type FormCardProps = {
  location: string;
  usernames: string[];
  setShowForm: (show: boolean) => void;
  locationId?: number;
};

export default function LocationFormCard({
  location,
  usernames,
  setShowForm,
  locationId,
}: FormCardProps) {
  const queryClient = useQueryClient();

  return (
    <Card className='flex min-w-[280px] max-w-[320px] flex-col rounded-md md:min-w-[480px] md:max-w-[640px]'>
      <CardHeader className='flex w-full justify-center'>
        <span className='text-md md:text-semibold w-full text-center capitalize md:text-base'>
          {locationId ? 'Edit Location' : 'Create New Location'}
        </span>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className='flex w-full justify-center'>
          <LocationForm
            location={location}
            usernames={usernames}
            onSuccess={() => {
              setShowForm(false);
              queryClient.invalidateQueries({ queryKey: ['locations'] });
            }}
            onCancel={() => setShowForm(false)}
            locationId={locationId}
          />
        </div>
      </CardBody>
      <CardFooter />
    </Card>
  );
}
