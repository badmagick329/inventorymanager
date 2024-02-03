import { Card, CardHeader, CardBody, Divider, Button } from '@nextui-org/react';
import { Plus } from 'lucide-react';

export default function FormCover({
  setShowForm,
}: {
  setShowForm: (show: boolean) => void;
}) {
  return (
    <Card className='flex min-h-[172px] min-w-[288px] max-w-[320px] flex-col rounded-md md:min-w-[480px] md:max-w-[640px]'>
      <CardHeader className='flex w-full justify-center'>
        <p className='text-md md:text-semibold w-full text-center capitalize md:text-base'>
          Create New User
        </p>
      </CardHeader>
      <Divider />
      <CardBody className='flex w-full items-center justify-center gap-2 text-center text-default-400'>
        <Button
          onClick={() => setShowForm(true)}
          color='success'
          variant='light'
          isIconOnly
        >
          <Plus />
        </Button>
      </CardBody>
    </Card>
  );
}
