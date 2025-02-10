import { Button } from "@heroui/react";

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
      <div className={`max-w-[${width}px] mx-2 rounded-md px-2 pb-2 pt-4`}>
        <video controls>
          <source src={`/videos/${videoName}`} type='video/mp4' />
        </video>
      </div>
      <div>
        <Button
          color='default'
          variant='bordered'
          onPress={callback}
          radius='sm'
        >
          Hide Video
        </Button>
      </div>
    </div>
  );
}
