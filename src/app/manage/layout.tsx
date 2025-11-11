import DropdownAvatar from '@/app/manage/dropdown-avatar';
import MobileNavLinks from '@/app/manage/mobile-nav-links';
import NavLinks from '@/app/manage/nav-links';
import { ModeToggle } from '@/components/ToggleTheme';
import AdminConversationDialog from '@/components/admin-conversation-dialog';
import { QuickReminderDialog } from '@/components/reminderDialog';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <NavLinks />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <MobileNavLinks />
          <div className="relative ml-auto flex-1 md:grow-0">
            <div className="flex items-center justify-end gap-2">
              <QuickReminderDialog triggerVariant="icon" />
              <AdminConversationDialog />
              <ModeToggle />
            </div>
          </div>
          <DropdownAvatar />
        </header>
        {children}
      </div>
    </div>
  );
}
