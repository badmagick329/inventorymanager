import { ConnectionError, GenericError } from '@/components/errors';
import { APP_LOCATIONS } from '@/consts/urls';
import { Button, Link } from '@nextui-org/react';

export default function OptionalErrorElement({
  errorMessage,
}: {
  errorMessage: string;
}): JSX.Element | null {
  let message;
  if (errorMessage.includes('404')) {
    message = 'Location not found. It may have been deleted.';
    return (
      <GenericError message={message}>
        <Button
          as={Link}
          href={APP_LOCATIONS}
          variant='flat'
          radius='sm'
          color='default'
        >
          Back to Locations
        </Button>
      </GenericError>
    );
  } else if (errorMessage.includes('500')) {
    message = 'Failed to load items. ' + errorMessage;
    return <ConnectionError message={message} />;
  }
  return null;
}
