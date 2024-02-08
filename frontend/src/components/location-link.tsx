import { Link } from '@nextui-org/react';

type LocationLinkProps = {
  id: number | undefined;
  name: string;
};

export default function LocationLink({ id, name }: LocationLinkProps) {
  if (id === undefined) {
    <>
      <span className='justify-center self-center p-2 md:text-xl'>{name}</span>
    </>;
  }
  return (
    <Link href={`/app/items/${id}`}>
      <span className='justify-center self-center p-2 text-primary-500 hover:cursor-pointer hover:text-primary-200 md:text-xl'>
        {name}
      </span>
    </Link>
  );
}
