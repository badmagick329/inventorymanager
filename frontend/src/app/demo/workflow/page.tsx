import VideoPlayer from './_componenets/video-player';
import InstructionText from './_componenets/instruction-text';
import { Spacer } from '@nextui-org/react';

const WIDTH = 1280;

export default function AppDemo() {
  return (
    <div className='mt-4 flex w-full flex-col items-center gap-6 p-2'>
      <span className='text-4xl font-bold tracking-wide'>Demo</span>
      <span className='text-lg'>
        These steps demonstrate a typical workflow for data entry with this app.
        Please watch the videos for each step for further details.
      </span>
      {videosAndText.map((data, idx) => {
        return (
          <>
            <Spacer y={2} />
            <div
              className={`flex w-full max-w-[${WIDTH}px] flex-col p-4 items-center rounded-md bg-neutral-100 dark:bg-neutral-950`}
              key={data.video}
            >
              <InstructionText step={idx + 1} text={data.text} width={WIDTH} />
              <VideoPlayer width={WIDTH} videoName={data.video} />
            </div>
          </>
        );
      })}
    </div>
  );
}
const videosAndText = [
  {
    video: '01_Create_Location.mp4',
    text: 'Start by creating a new school location.',
  },
  {
    video: '02_Create_Item.mp4',
    text: 'Now we can create our first item entry.',
  },
  {
    video: '03_Create_Sale.mp4',
    text: 'After creating the item we can enter sale data for this item on the sales page.',
  },
  {
    video: '04_Create_Sale_2.mp4',
    text: 'This item can be sold to multiple vendors.',
  },
  {
    video: '05_Update_Sale.mp4',
    text: 'Once an owed amount is paid we can update it from the sales page.',
  },
];
