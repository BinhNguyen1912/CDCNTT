'use client';
import { useEffect, useRef } from 'react';
import { useAppStore } from '@/components/app-provider';
import { toast } from 'react-toastify';

interface NewOrderSoundProps {
  hasNewOrder?: boolean;
}

export default function NewOrderSound({
  hasNewOrder = false,
}: NewOrderSoundProps) {
  const socket = useAppStore((state) => state.socket);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!socket) return;

    const playNotificationSound = () => {
      try {
        // Tạo audio element mới mỗi lần để tránh conflict
        const audio = new Audio('/sound_new_order.mp3');
        audio.volume = 0.7; // Điều chỉnh âm lượng
        audio.preload = 'auto';

        // Thêm event listeners
        audio.addEventListener('canplaythrough', () => {
          audio.play().catch((error) => {
            console.warn('Could not play notification sound:', error);
          });
        });

        audio.addEventListener('error', (error) => {
          console.warn('Audio error:', error);
        });

        // Load audio
        audio.load();

        // Cleanup sau khi phát xong
        audio.addEventListener('ended', () => {
          audio.remove();
        });
      } catch (error) {
        console.warn('Error creating audio:', error);
      }
    };

    socket.on('new-order', (data) => {
      console.log('New order received in NewOrderSound:', data);
      // toast.success(
      //   `Khách hàng ${data.guest?.name} vừa đặt đơn mới tại bàn ${data.tableNode?.name} `,
      // );
      playNotificationSound();
    });

    // Cleanup
    return () => {
      socket.off('new-order');
    };
  }, [socket]);

  // Nếu có prop hasNewOrder từ parent component, phát âm thanh
  useEffect(() => {
    if (hasNewOrder) {
      try {
        const audio = new Audio('/sound_new_order.mp3');
        audio.volume = 0.7;
        audio.play().catch((error) => {
          console.warn('Could not play notification sound from prop:', error);
        });
      } catch (error) {
        console.warn('Error creating audio from prop:', error);
      }
    }
  }, [hasNewOrder]);

  return null;
}
