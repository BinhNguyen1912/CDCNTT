import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ReminderTable from '@/app/manage/reminders/reminder-table';
import { Suspense } from 'react';
import LowStockWarningDialog from '@/components/lowStockWarningDialog';
import CallStaffNotification from '@/components/CallStaffNotification';

export default function RemindersPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle>Lời nhắc</CardTitle>
            <CardDescription>
              Quản lý các lời nhắc và công việc cần thực hiện
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <ReminderTable />
            </Suspense>
          </CardContent>
        </Card>
        <LowStockWarningDialog />
        <CallStaffNotification />
      </div>
    </main>
  );
}
