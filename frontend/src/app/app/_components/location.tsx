export default function Location({ name }: { name: string }) {
  return (
    <>
      <span className='justify-center self-center p-2 text-primary-500 hover:cursor-pointer hover:text-primary-200 md:text-xl'>
        {name}
      </span>
    </>
  );
}
