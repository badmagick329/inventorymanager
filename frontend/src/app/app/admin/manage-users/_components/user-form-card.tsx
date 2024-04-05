import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
} from '@nextui-org/react';

import UserForm from './user-form';

type FormCardProps = {
  setShowForm: (show: boolean) => void;
};

export default function UserFormCard({ setShowForm }: FormCardProps) {
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
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </CardBody>
      <CardFooter />
    </Card>
  );
}
