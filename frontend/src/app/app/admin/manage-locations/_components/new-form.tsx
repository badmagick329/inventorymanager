import LocationForm from './location-form';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Button,
} from '@nextui-org/react';
import { Plus } from 'lucide-react';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function NewForm() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  // TODO: fetch usernames from the server
  const usernames = ['testuser1'];
  if (showForm) {
    return (
      <Card className='flex min-w-[280px] max-w-[320px] flex-col rounded-md md:min-w-[480px] md:max-w-[640px]'>
        <CardHeader className='flex w-full justify-center'>
          <span className='text-md md:text-semibold w-full text-center capitalize md:text-base'>
            Create New Location
          </span>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className='flex w-full justify-center'>
            <LocationForm
              location=''
              usernames={usernames}
              onSuccess={() => {
                setShowForm(false);
                queryClient.invalidateQueries({ queryKey: ['locations'] });
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </CardBody>
        <CardFooter />
      </Card>
    );
  }
  return (
    <Card className='flex min-w-[288px] max-w-[320px] flex-col rounded-md md:min-w-[480px] md:max-w-[640px] min-h-[172px]'>
      <CardHeader className='flex w-full justify-center'>
        <p className='text-md md:text-semibold w-full text-center capitalize md:text-base'>
          Create New Location
        </p>
      </CardHeader>
      <Divider />
      <CardBody className='flex w-full items-center justify-center gap-2 text-center text-default-400'>
        <Button
          onClick={() => setShowForm(true)}
          color='success'
          variant='ghost'
          isIconOnly
        >
          <Plus />
        </Button>
      </CardBody>
    </Card>
  );
}
