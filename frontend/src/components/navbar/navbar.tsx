import LocationsNavItem from './locations-nav-item';
import LoggedInDropdown from './logged-in-dropdown';
import ThemeToggler from './theme-toggler';

export default function Navbar() {
  return (
    <nav className='foreground flex h-[55px] w-full items-center bg-neutral-100 p-2 dark:bg-neutral-950'>
      <ul className='flex w-full items-center justify-between gap-4'>
        <li>
          <div className='flex items-center gap-2'>
            <LocationsNavItem />
          </div>
        </li>
        <li>
          <div className='flex h-full items-center gap-2'>
            <ThemeToggler />
            <LoggedInDropdown />
          </div>
        </li>
      </ul>
    </nav>
  );
}
