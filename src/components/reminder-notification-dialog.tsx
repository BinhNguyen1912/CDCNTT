'use client';
import React, { useEffect } from 'react';
import { Bell, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  useCompleteReminderLog,
  useGetReminderLogs,
} from '@/app/queries/useReminder';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

interface ReminderEventData {
  reminderId: number;
  title: string;
  description: string | null;
  assignedRole: number[];
  timestamp: string;
  jobId: string;
}

interface ReminderNotificationDialogProps {
  reminder: ReminderEventData;
  onClose: () => void;
}

export default function ReminderNotificationDialog({
  reminder,
  onClose,
}: ReminderNotificationDialogProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: logsData } = useGetReminderLogs({
    id: reminder.reminderId,
    enabled: isOpen,
  });
  const completeReminderLog = useCompleteReminderLog();

  // Tìm log gần nhất (PENDING) để complete
  // Ưu tiên tìm log có scheduled_at gần với timestamp nhất
  const pendingLog = logsData?.payload
    ?.filter((log: any) => log.status === 'PENDING')
    .sort((a: any, b: any) => {
      const timeA = Math.abs(
        new Date(a.scheduled_at).getTime() -
          new Date(reminder.timestamp).getTime(),
      );
      const timeB = Math.abs(
        new Date(b.scheduled_at).getTime() -
          new Date(reminder.timestamp).getTime(),
      );
      return timeA - timeB;
    })[0];

  const handleClose = () => {
    setIsOpen(false);
    // Refetch bảng lời nhắc khi đóng dialog
    queryClient.invalidateQueries({ queryKey: ['reminders'] });
    // Phát tín hiệu toàn cục để dừng âm thanh ngay lập tức
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('stop-reminder-sound'));
    }
    onClose();
  };

  const handleComplete = async () => {
    if (!pendingLog) {
      toast.warning('Không tìm thấy log để đánh dấu hoàn thành');
      return;
    }

    try {
      // Tắt âm thanh ngay khi người dùng nhấn hoàn thành
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('stop-reminder-sound'));
      }
      onClose();
      await completeReminderLog.mutateAsync({
        id: reminder.reminderId,
        logId: Number(pendingLog.id),
      });
      toast.success('Đã đánh dấu lời nhắc hoàn thành!');
      // Refetch bảng lời nhắc sau khi hoàn thành
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    } catch (error: any) {
      console.error('Error completing reminder:', error);
      toast.error(
        error?.payload?.message ||
          error?.message ||
          'Có lỗi xảy ra khi đánh dấu hoàn thành',
      );
    }
  };

  const handleViewAll = () => {
    // Dừng âm thanh và đóng dialog ngay
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('stop-reminder-sound'));
    }
    setIsOpen(false);
    onClose();
    // Điều hướng đến trang danh sách lời nhắc
    router.push('/manage/reminders');
  };

  const formattedTime = format(new Date(reminder.timestamp), 'HH:mm');
  const formattedDate = format(new Date(reminder.timestamp), 'dd/MM/yyyy');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Lời nhắc
          </DialogTitle>
          <DialogDescription>
            Bạn có một lời nhắc mới cần thực hiện
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{reminder.title}</h3>
          </div>

          {reminder.description && (
            <div>
              <p className="text-sm text-muted-foreground">
                {reminder.description}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {formattedDate} lúc {formattedTime}
            </span>
          </div>

          {reminder.assignedRole && reminder.assignedRole.length > 0 && (
            <div>
              <Badge variant="secondary" className="text-xs">
                {reminder.assignedRole.length} vai trò được giao
              </Badge>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={handleViewAll}
              className="flex-1"
            >
              Xem tất cả
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Đóng
            </Button>
            {pendingLog && (
              <Button
                onClick={handleComplete}
                disabled={completeReminderLog.isPending}
                className="flex-1 gap-2"
              >
                {completeReminderLog.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Đã hoàn thành
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
