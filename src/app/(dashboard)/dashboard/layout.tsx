'use client';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import {
  IconLayoutDashboard,
  IconBriefcase,
  IconUser,
  IconLogout,
  IconChevronRight,
} from '@tabler/icons-react';

import { Role } from '@/lib/auth-middleware';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';

type Navlink = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

const studentNavLinks: Navlink[] = [
  { title: 'Dashboard', href: '/', icon: <IconLayoutDashboard size={17} /> },
  {
    title: 'Applied Jobs',
    href: '/applied-jobs',
    icon: <IconBriefcase size={17} />,
  },
  { title: 'Profile', href: '/profile', icon: <IconUser size={17} /> },
  { title: 'Logout', href: '/logout', icon: <IconLogout size={17} /> },
];

const companyNavLinks: Navlink[] = [
  { title: 'Dashboard', href: '/', icon: <IconLayoutDashboard size={17} /> },
  {
    title: 'Post Job',
    href: '/post-job',
    icon: <IconBriefcase size={17} />,
  },
  { title: 'Profile', href: '/profile', icon: <IconUser size={17} /> },
  { title: 'Logout', href: '/logout', icon: <IconLogout size={17} /> },
];

const getSelectedLink = (path: string): string => {
  const links = studentNavLinks
    .map((el) => el.href)
    .concat(companyNavLinks.map((el) => el.href));
  const link = path.split('/dashboard')[1] ?? '';
  return links.includes(link) ? link : '/';
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data } = useSession();
  const role = data?.user?.user_type as Role;
  const path = usePathname();
  const [selectedLink, setSelectedLink] = useState(() => getSelectedLink(path));
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navlinks = role === 'applicant' ? studentNavLinks : companyNavLinks;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuState ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuState]);

  if (!role) return null;

  return (
    <div className="mx-auto flex h-screen w-full max-w-7xl">
      {/* ── Desktop sidebar ── */}
      <aside className="bg-background border-border hidden h-screen w-55 min-w-55 flex-col border-r lg:flex">
        <Logo className="border-b px-4 py-6" />

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 space-y-1 px-3 py-4">
          <DesktopLinks
            navlinks={navlinks}
            selectedLink={selectedLink}
            setSelectedLink={setSelectedLink}
          />
        </nav>
      </aside>

      {/* ── Mobile layout ── */}
      <div className="relative flex min-h-screen flex-1 flex-col lg:hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-40 px-3 pt-3">
          <nav
            className={cn(
              'mx-auto px-5 transition-all duration-300',
              isScrolled
                ? 'bg-background/70 border-border rounded-2xl border shadow-sm backdrop-blur-lg'
                : 'bg-background border-border rounded-2xl border shadow-sm',
            )}
          >
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center justify-center gap-1.5">
                <Link href="/dashboard">
                  <Logo />
                </Link>
              </div>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                className="hover:bg-muted relative rounded-lg p-2 transition-colors"
              >
                <Menu
                  className={cn(
                    'text-muted-foreground absolute inset-0 m-auto size-5 transition-all duration-200',
                    menuState
                      ? 'scale-0 rotate-180 opacity-0'
                      : 'scale-100 rotate-0 opacity-100',
                  )}
                />
                <X
                  className={cn(
                    'text-muted-foreground size-5 transition-all duration-200',
                    menuState
                      ? 'scale-100 rotate-0 opacity-100'
                      : 'scale-0 -rotate-180 opacity-0',
                  )}
                />
              </button>
            </div>
          </nav>
        </header>

        {/* Full-screen overlay */}
        <div
          className={cn(
            'bg-background fixed inset-0 z-300 flex flex-col transition-all duration-300',
            menuState
              ? 'pointer-events-auto scale-100 opacity-100'
              : 'pointer-events-none scale-[0.97] opacity-0',
          )}
        >
          {/* Overlay header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Logo />
            <button
              onClick={() => setMenuState(false)}
              className="border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-accent flex h-9 w-9 items-center justify-center rounded-full border transition-all"
            >
              <X size={15} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-4 py-3">
            <MobileLinks
              navlinks={navlinks}
              selectedLink={selectedLink}
              setSelectedLink={setSelectedLink}
              onNavigate={() => setMenuState(false)}
              isOpen={menuState}
            />
          </nav>

          {/* Footer */}
          <div className="border-border flex gap-5 border-t px-6 py-5">
            {['Help', 'Privacy', 'Terms'].map((l) => (
              <span
                key={l}
                className="text-muted-foreground/50 hover:text-muted-foreground cursor-pointer text-xs transition-colors"
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Page content */}
        <main className="bg-background min-w-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Desktop main */}
      <main className="bg-background hide-scrollbar hidden min-w-0 flex-1 overflow-y-auto lg:flex">
        {children}
      </main>
    </div>
  );
};

/* ── Desktop nav links ── */
type RendererProps = {
  navlinks: Navlink[];
  selectedLink: string;
  setSelectedLink: Dispatch<SetStateAction<string>>;
  onNavigate?: () => void;
  isOpen?: boolean;
};

const DesktopLinks = ({
  navlinks,
  selectedLink,
  setSelectedLink,
}: RendererProps) => (
  <>
    {navlinks.map((nav) => {
      const isLogout = nav.title === 'Logout';
      const isActive = selectedLink === nav.href;

      const base = cn(
        'group flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm transition-all duration-150 w-full text-left cursor-pointer relative',
        isLogout
          ? 'bg-transparent border-transparent text-destructive/70 hover:bg-destructive/5 hover:border-destructive/15 hover:text-destructive font-normal'
          : 'bg-transparent border-transparent text-muted-foreground hover:bg-primary/10 hover:border-primary/20 hover:text-primary font-normal',
        isActive &&
          (isLogout
            ? 'bg-destructive/10 border-destructive/20 text-destructive font-medium'
            : 'bg-primary/10 border-primary/20 text-primary font-medium'),
      );

      const iconCn = cn(
        'flex-shrink-0 flex transition-colors',
        isLogout ? 'text-destructive/40' : 'text-muted-foreground',
        !isActive &&
          (isLogout
            ? 'group-hover:text-destructive'
            : 'group-hover:text-primary'),
        isActive && (isLogout ? 'text-destructive' : 'text-primary'),
      );

      const indicator = isActive && (
        <span
          className={cn(
            'bg-primary absolute top-1/2 left-0 h-[55%] w-0.75 -translate-y-1/2 rounded-r-sm',
            isLogout && 'bg-destructive',
          )}
        />
      );

      return isLogout ? (
        <button
          key="logout"
          className={base}
          onClick={() => {
            setSelectedLink(nav.href);
            signOut({ callbackUrl: '/' });
          }}
        >
          {indicator}
          <span className={iconCn}>{nav.icon}</span>
          {nav.title}
        </button>
      ) : (
        <Link
          key={nav.href}
          href={'/dashboard' + nav.href}
          className={base}
          onClick={() => setSelectedLink(nav.href)}
        >
          {indicator}
          <span className={iconCn}>{nav.icon}</span>
          {nav.title}
        </Link>
      );
    })}
  </>
);

/* ── Mobile nav links ── */
const MobileLinks = ({
  navlinks,
  selectedLink,
  setSelectedLink,
  onNavigate,
  isOpen,
}: RendererProps) => (
  <>
    {navlinks.map((nav, i) => {
      const isLogout = nav.title === 'Logout';
      const isActive = selectedLink === nav.href;

      return (
        <div key={nav.href}>
          {isLogout && <div className="bg-border mx-1 my-2 h-px" />}

          {isLogout ? (
            <button
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-base font-medium tracking-tight transition-all duration-200',
                'text-destructive/70 hover:bg-destructive/5 hover:border-destructive/10 border-transparent',
                isActive && 'bg-destructive/5 border-destructive/10',
                isOpen
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-2 opacity-0',
              )}
              style={{ transitionDelay: isOpen ? `${i * 45}ms` : '0ms' }}
              onClick={() => {
                setSelectedLink(nav.href);
                signOut({ callbackUrl: '/' });
              }}
            >
              <span>{nav.icon}</span>
              <span className="flex-1">{nav.title}</span>
              <IconChevronRight size={15} className="text-destructive/30" />
            </button>
          ) : (
            <Link
              href={'/dashboard' + nav.href}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-4 py-3.5',
                'text-base font-medium tracking-tight transition-all duration-200',
                'text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground border-transparent',
                isActive && 'bg-primary/10 border-primary/20 text-primary',
                isOpen
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-2 opacity-0',
              )}
              style={{ transitionDelay: isOpen ? `${i * 45}ms` : '0ms' }}
              onClick={() => {
                setSelectedLink(nav.href);
                onNavigate?.();
              }}
            >
              <span className="flex shrink-0 translate-y-[1px] items-center">
                {nav.icon}
              </span>
              <span className="flex-1 leading-none">{nav.title}</span>
              <IconChevronRight
                size={15}
                className={cn(
                  'shrink-0 translate-y-[1px]',
                  isActive ? 'text-primary' : 'text-muted-foreground/40',
                )}
              />
            </Link>
          )}
        </div>
      );
    })}
  </>
);

export default Layout;
