'use client';

import Link from 'next/link';
import { Menu, Package2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NavItems from '@/app/(public)/nav-items';
import { ModeToggle } from '@/components/ToggleTheme';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import GuestMessageDialog from '@/components/guest-message-dialog';
import { QuickReminderDialog } from '@/components/reminderDialog';

export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const isGuestMenu = pathname?.includes('/guest/menu');
  const isGuestRoute = pathname?.includes('/guest/');

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={
        `fixed top-0 left-0 right-0 z-30 flex h-16 items-center gap-4 px-4 md:px-6 transition-colors duration-300 ` +
        (isGuestMenu || (mounted && scrolled)
          ? 'border-b border-border bg-background/90 backdrop-blur'
          : 'border-b border-transparent bg-transparent')
      }
    >
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="#"
          className={
            `flex items-center gap-2 text-lg font-semibold md:text-base ` +
            (isGuestMenu || (mounted && scrolled)
              ? 'text-foreground'
              : 'text-white drop-shadow')
          }
        >
          <Package2 className="h-6 w-6" />
          <span className="sr-only">Big boy</span>
        </Link>
        <NavItems
          className={
            (isGuestMenu || (mounted && scrolled)
              ? 'text-muted-foreground hover:text-foreground'
              : 'text-white/90 hover:text-white drop-shadow') +
            ' transition-colors flex-shrink-0'
          }
        />
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant={isGuestMenu || (mounted && scrolled) ? 'outline' : 'ghost'}
            size="icon"
            className={
              'shrink-0 md:hidden ' +
              (isGuestMenu || (mounted && scrolled)
                ? ''
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20')
            }
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Big boy</span>
            </Link>
            <NavItems className="text-muted-foreground transition-colors hover:text-foreground" />
          </nav>
        </SheetContent>
      </Sheet>
      <div className="ml-auto flex items-center gap-2">
        {isGuestRoute && <GuestMessageDialog />}
        <ModeToggle />
      </div>
    </header>
  );
}
