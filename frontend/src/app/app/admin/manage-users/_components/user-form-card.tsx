import UserForm from './user-form';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
} from '@nextui-org/react';

import { useQueryClient } from '@tanstack/react-query';

type FormCardProps = {
  setShowForm: (show: boolean) => void;
};

export default function UserFormCard({ setShowForm }: FormCardProps) {
  const queryClient = useQueryClient();

  return (
    <Card className='flex min-w-[280px] max-w-[320px] flex-col rounded-md md:min-w-[480px] md:max-w-[640px]'>
      <CardHeader className='flex w-full justify-center'>
        <span className='text-md md:text-semibold w-full text-center capitalize md:text-base'>
          Create New User
        </span>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className='flex w-full justify-center'>
          <UserForm
            onSuccess={() => {
              setShowForm(false);
              queryClient.invalidateQueries({ queryKey: ['users'] });
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </CardBody>
      <CardFooter />
    </Card>
  );
}
