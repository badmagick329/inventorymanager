import Image from 'next/image';
import Link from 'next/link';

import NotFoundImage from '../../public/images/not-found.svg';

export default function NotFound() {
  return (
    <div className='flex min-h-dvh flex-col items-center justify-center gap-4'>
      <Image
        width={200}
        height={200}
        src={NotFoundImage}
        alt='Page Not Found'
        unoptimized
        className='pl-6'
      />
      <span className='text-2xl font-semibold'>Page Not Found</span>
      <Link
        className='text-lg font-semibold text-primary underline'
        href='/app'
      >
        Return Home
      </Link>
    </div>
  );
}
