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
    <Card className='flex min-h-52 w-full flex-col rounded-lg border border-border bg-card shadow-none'>
      <CardHeader className='flex w-full justify-start px-5 py-4'>
        <span
          data-testid='location-form-title'
          className='w-full font-semibold'
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
