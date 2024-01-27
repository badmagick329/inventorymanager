import LogoutButton from './LogoutButton';

export default function MePage() {
  return (
    <div className='flex flex-col gap-2'>
      <span className='text-2xl'>Super secret page</span>
      <LogoutButton />
    </div>
  );
}
