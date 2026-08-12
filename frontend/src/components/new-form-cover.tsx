import { ICON_LG } from '@/consts';
import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Plus } from 'lucide-react';

export default function NewFormCover({
  title,
  setShowForm,
}: {
  title: string;
  setShowForm: (show: boolean) => void;
}) {
  return (
    <Card className='flex min-h-52 w-full flex-col rounded-lg border border-dashed border-border bg-muted/20 shadow-none'>
      <CardHeader className='flex items-center justify-start gap-2 px-5 py-4'>
        <p className='font-semibold'>{title}</p>
      </CardHeader>
      <Divider />
      <Button
        data-testid='card-create-button'
        className='h-full w-full rounded-none text-muted-foreground'
        variant='light'
        radius='sm'
        onPress={() => setShowForm(true)}
      >
        <CardBody className='flex w-full items-center justify-center gap-2'>
          <span className='flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-primary'>
            <Plus size={ICON_LG} />
          </span>
        </CardBody>
      </Button>
    </Card>
  );
}
