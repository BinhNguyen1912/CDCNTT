// hooks/useLoading.ts
'use client';

import { useState, useEffect } from 'react';

export const useLoading = (duration = 4000) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 - prev) * 0.1;
      });
    }, 100);

    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      clearInterval(progressInterval);
    }, duration);

    return () => {
      clearTimeout(loadingTimer);
      clearInterval(progressInterval);
    };
  }, [duration]);

  return { isLoading, progress };
};
