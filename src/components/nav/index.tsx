'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { IconChevronRight } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Logo } from '../logo';

const menuItems = [
  { name: 'Features', href: '/#features' },
  { name: 'Pricing', href: '/#pricing' },
];

export const Navbar = ({ hideLinks = false }: { hideLinks?: boolean }) => {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open (mirrors first component)
  useEffect(() => {
    document.body.style.overflow = menuState ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuState]);

  return (
    <header>
      {/* ── Desktop nav ── */}
      <nav className="fixed z-20 w-full px-2">
        <div
          className={cn(
            'mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12',
            isScrolled &&
              'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5',
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/">
                <Logo />
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                className="hover:bg-muted relative -m-2.5 -mr-4 block cursor-pointer rounded-lg p-2.5 transition-colors lg:hidden"
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

            {/* Desktop center links */}
            {!hideLinks && (
              <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                <ul className="flex gap-8 text-sm">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Desktop CTA buttons */}
            <div className="hidden lg:flex lg:gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/login">
                  <span>Login</span>
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">
                  <span>Sign Up</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile full-screen overlay (mirrors first component's structure) ── */}
      <div
        className={cn(
          'bg-background fixed inset-0 z-30 flex flex-col transition-all duration-300 lg:hidden',
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
          {!hideLinks &&
            menuItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3.5',
                  'text-base font-medium tracking-tight transition-all duration-200',
                  'text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground border-transparent',
                  menuState
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-2 opacity-0',
                )}
                style={{ transitionDelay: menuState ? `${i * 45}ms` : '0ms' }}
                onClick={() => setMenuState(false)}
              >
                <span className="flex-1 leading-none">{item.name}</span>
                <IconChevronRight
                  size={15}
                  className="shrink-0 translate-y-[1px] text-muted-foreground/40"
                />
              </Link>
            ))}

          {/* Divider before auth buttons */}
          <div className="bg-border mx-1 my-2 h-px" />

          {/* Auth links as nav rows */}
          {[
            { label: 'Login', href: '/login' },
            { label: 'Sign Up', href: '/signup' },
          ].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3.5',
                'text-base font-medium tracking-tight transition-all duration-200',
                'text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground border-transparent',
                menuState
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-2 opacity-0',
              )}
              style={{
                transitionDelay: menuState
                  ? `${(menuItems.length + 1 + i) * 45}ms`
                  : '0ms',
              }}
              onClick={() => setMenuState(false)}
            >
              <span className="flex-1 leading-none">{item.label}</span>
              <IconChevronRight
                size={15}
                className="shrink-0 translate-y-[1px] text-muted-foreground/40"
              />
            </Link>
          ))}
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
    </header>
  );
};