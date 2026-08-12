import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
} from "@heroui/react";

import UserForm from './user-form';

type FormCardProps = {
  setShowForm: (show: boolean) => void;
};

export default function UserFormCard({ setShowForm }: FormCardProps) {
  return (
    <Card className='flex min-h-52 w-full flex-col rounded-lg border border-border bg-card shadow-none'>
      <CardHeader className='flex w-full justify-start px-5 py-4'>
        <span
          data-testid='user-form-title'
          className='w-full font-semibold'
        >
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
