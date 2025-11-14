import { Spacer } from '@heroui/react';

import InstructionText from './_componenets/instruction-text';
import VideoPlayer from './_componenets/video-player';

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
          <div
            className={`flex w-full max-w-[${WIDTH}px] flex-col items-center rounded-md p-4`}
            key={data.video}
          >
            <Spacer y={2} />
            <InstructionText step={idx + 1} text={data.text} width={WIDTH} />
            <VideoPlayer width={WIDTH} videoName={data.video} />
          </div>
        );
      })}
    </div>
  );
}
const videosAndText = [
  {
    video: '01_Create_Location_And_User.mp4',
    text: 'Start by creating a location and users.',
  },
  {
    video: '02_Add_Items.mp4',
    text: 'Now we can create our first item entry.',
  },
  {
    video: '03_Add_Sale.mp4',
    text: 'After creating the item we can enter sale data for this item on the sales page.',
  },
  {
    video: '04_Adding_More_Sales.mp4',
    text: "Here's some more examples of adding sales.",
  },
  {
    video: '05_Manage_Vendors.mp4',
    text: 'We can manage vendors from the vendors page.',
  },
  {
    video: '06_Logs.mp4',
    text: 'A history of all entries and changes can be viewed from the logs page.',
  },
  {
    video: '07_Bonus_Tip_01.mp4',
    text: 'Bonus Tip: You can hover over the price fields to view the exact amount.',
  },
  {
    video: '08_Bonus_Tip_02.mp4',
    text: 'Bonus Tip: You can click show more to view some additional location information.',
  },
  {
    video: '09_Bonus_Tip_03.mp4',
    text: 'Bonus Tip: "Mark as fully paid" button will adjust to any quantity or cost changes in the form.',
  },
];
