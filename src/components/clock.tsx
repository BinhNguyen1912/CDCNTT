'use client';

import { useEffect, useState } from 'react';

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[200px] flex items-center justify-center bg-gradient-to-r from-black via-gray-900 to-black text-white text-4xl font-mono tracking-widest rounded-lg opacity-85">
      <div className="text-center">
        <div className="mb-2 drop-shadow-lg">{time.toLocaleTimeString()}</div>
        <div className="text-lg text-gray-400">{time.toLocaleDateString()}</div>
      </div>
    </div>
  );
}

export default Clock;
