import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
} from "@heroui/react";

import LocationForm from './location-form';

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
  return (
    <Card className='flex min-w-[280px] max-w-[320px] flex-col rounded-md md:min-w-[480px] md:max-w-[640px]'>
      <CardHeader className='flex w-full justify-center'>
        <span
          data-testid='location-form-title'
          className='text-md md:text-semibold w-full text-center capitalize md:text-base'
        >
          {locationId ? 'Edit Location' : 'Create New Location'}
        </span>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className='flex w-full justify-center'>
          <LocationForm
            location={location}
            usernames={usernames}
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
            locationId={locationId}
          />
        </div>
      </CardBody>
      <CardFooter />
    </Card>
  );
}
