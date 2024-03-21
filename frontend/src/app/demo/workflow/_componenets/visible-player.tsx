import { Button } from '@nextui-org/react';

export default function VisiblePlayer({
  width,
  videoName,
  callback,
}: {
  width: number;
  videoName: string;
  callback: () => void;
}) {
  return (
    <div className='flex flex-col items-center p-4'>
      <div className={`max-w-[${width}px] rounded-md px-2 pt-4 pb-2 mx-2`}>
        <video controls>
          <source src={`/videos/${videoName}`} type='video/mp4' />
        </video>
      </div>
      <div>
        <Button
          className='rounded-md'
          color='default'
          variant='bordered'
          onPress={callback}
        >
          Hide Video
        </Button>
      </div>
    </div>
  );
}
