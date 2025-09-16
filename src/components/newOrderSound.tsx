'use client';
import { useRef, useState } from 'react';

export default function NewOrderSound({
  hasNewOrder,
}: {
  hasNewOrder: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(true);

  const enableSound = () => {
    audioRef.current?.play().catch(() => {});
    setEnabled(true);
  };

  if (hasNewOrder && enabled) {
    audioRef.current?.play().catch((err) => console.log('Lỗi play:', err));
  }

  return (
    <div>
      {!enabled && (
        <button
          onClick={enableSound}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Bật âm thanh thông báo
        </button>
      )}
      <audio ref={audioRef} src="/sound_new_order.mp3" preload="auto" />
    </div>
  );
}
