'use client';
import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/components/app-provider';
import ReminderNotificationDialog from '@/components/reminder-notification-dialog';
import { toast } from 'react-toastify';

interface ReminderEventData {
  reminderId: number;
  title: string;
  description: string | null;
  assignedRole: number[];
  timestamp: string;
  jobId: string;
}

interface ReminderErrorData {
  reminderId: number;
  title: string;
  error: string;
  timestamp: string;
}

/**
 * Component để xử lý socket events cho reminders
 * - Subscribe reminder-triggered (broadcast)
 * - Subscribe reminder-notification (targeted)
 * - Subscribe reminder-error (error handling)
 */
export default function ReminderSocketHandler() {
  console.log('🔵 ReminderSocketHandler component mounted');

  const socket = useAppStore((state) => state.socket);
  const [currentReminder, setCurrentReminder] =
    useState<ReminderEventData | null>(null);
  const reminderAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasShownToastRef = useRef<boolean>(false);

  const startReminderSound = () => {
    try {
      // Nếu đang phát rồi thì không tạo mới
      if (reminderAudioRef.current && !reminderAudioRef.current.paused) {
        return;
      }

      const audio = new Audio('/ring-for-reminders.mp3');
      audio.loop = true;
      audio.volume = 0.8;
      audio.preload = 'auto';
      reminderAudioRef.current = audio;

      const play = () => {
        audio
          .play()
          .catch((err) => console.warn('Could not play reminder sound:', err));
      };

      if (audio.readyState >= 2) {
        play();
      } else {
        audio.addEventListener('canplaythrough', play, { once: true });
        audio.load();
      }
    } catch (error) {
      console.warn('Error starting reminder sound:', error);
    }
  };

  const stopReminderSound = () => {
    try {
      if (reminderAudioRef.current) {
        try {
          // Cắt âm ngay lập tức
          reminderAudioRef.current.muted = true;
          reminderAudioRef.current.volume = 0;
        } catch {}
        reminderAudioRef.current.pause();
        reminderAudioRef.current.currentTime = 0;
        // Xóa src để đảm bảo dừng hẳn
        try {
          reminderAudioRef.current.removeAttribute('src');
          // @ts-ignore
          reminderAudioRef.current.src = '';
          reminderAudioRef.current.load();
        } catch {}
        reminderAudioRef.current = null;
      }
    } catch {}
  };

  // Dừng âm thanh khi dialog đóng (currentReminder bị clear ở bất kỳ nơi nào)
  useEffect(() => {
    if (!currentReminder) {
      stopReminderSound();
      hasShownToastRef.current = false; // reset cho lượt nhắc tiếp theo
    }
  }, [currentReminder]);

  // Lắng nghe sự kiện toàn cục để dừng âm thanh ngay khi được yêu cầu
  useEffect(() => {
    const handler = () => stopReminderSound();
    window.addEventListener('stop-reminder-sound', handler);
    return () => window.removeEventListener('stop-reminder-sound', handler);
  }, []);

  useEffect(() => {
    if (!socket) {
      console.log('🔌 No socket instance');
      return;
    }

    console.log(' Setting up reminder socket handlers...');

    // Handler cho reminder-triggered (broadcast event)
    function onReminderTriggered(data: ReminderEventData) {
      console.log(' Reminder triggered (broadcast):', data);

      console.log(' Showing reminder notification');

      if (!hasShownToastRef.current) {
        toast.info(`${data.title}`, { autoClose: 5000 });
        hasShownToastRef.current = true;
      }

      setCurrentReminder(data);
      startReminderSound();
    }

    // Handler cho reminder-notification (targeted event)
    function onReminderNotification(data: ReminderEventData) {
      console.log(' Reminder notification (targeted):', data);

      console.log(' Showing reminder notification (targeted)');
      // Chỉ hiện 1 toast, không nhân đôi nếu cả 2 event cùng đến
      if (!hasShownToastRef.current) {
        toast.info(` ${data.title}`, { autoClose: 5000 });
        hasShownToastRef.current = true;
      }

      // Hiển thị notification ưu tiên
      setCurrentReminder(data);
      // Phát âm thanh nhắc liên tục (tránh phát chồng)
      startReminderSound();
    }

    // Handler cho reminder-error
    function onReminderError(error: ReminderErrorData) {
      console.error(' Reminder error:', error);
      toast.error(`Lỗi reminder: ${error.title} - ${error.error}`, {
        autoClose: 7000,
      });
    }

    // Subscribe events
    console.log(' Subscribing to socket events...');
    socket.on('reminder-triggered', onReminderTriggered);
    socket.on('reminder-notification', onReminderNotification);
    socket.on('reminder-error', onReminderError);
    // Theo dõi trạng thái kết nối để debug
    socket.on('connect', () => {
      console.log(' Socket connected (reminder):', socket.id);
    });
    socket.on('connect_error', (err: any) => {
      console.error(' Socket connect_error (reminder):', err?.message || err);
    });
    if (process.env.NODE_ENV !== 'production') {
      socket.onAny((event, ...args) => {
        console.log(' Socket event received:', event, args?.[0]);
      });
    }
    console.log(' All reminder socket events subscribed');

    return () => {
      console.log(' Cleaning up reminder socket handlers...');
      socket.off('reminder-triggered', onReminderTriggered);
      socket.off('reminder-notification', onReminderNotification);
      socket.off('reminder-error', onReminderError);
      socket.off('connect');
      socket.off('connect_error');
      if (process.env.NODE_ENV !== 'production') {
        socket.offAny(() => {});
      }
      // Dừng âm thanh khi unmount/cleanup
      stopReminderSound();
    };
  }, [socket]);

  return (
    <>
      {currentReminder && (
        <ReminderNotificationDialog
          reminder={currentReminder}
          onClose={() => {
            setCurrentReminder(null);
            stopReminderSound();
          }}
        />
      )}
    </>
  );
}
