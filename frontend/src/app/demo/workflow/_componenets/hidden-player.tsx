import { Button } from '@nextui-org/react';

export default function HiddenPlayer({
  width,
  callback,
}: {
  width: number;
  callback: () => void;
}) {
  return (
    <div className={`max-w-[${width}px] rounded-md py-2 px-4 mx-2`}>
      <Button color='default' variant='bordered' radius='sm' onPress={callback}>
        Show Video
      </Button>
    </div>
  );
}
