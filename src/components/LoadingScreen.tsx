// components/LoadingScreen.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
interface LoadingScreenProps {
  progress: number;
}

const LoadingScreen = ({ progress }: LoadingScreenProps) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50"
      >
        {/* Logo với animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            className="filter grayscale"
          >
            <circle
              cx="60"
              cy="60"
              r="55"
              stroke="black"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M40 40 L80 80 M80 40 L40 80"
              stroke="black"
              strokeWidth="4"
            />
          </svg>
        </motion.div>

        {/* Text */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-2xl font-bold mb-6 text-black"
        >
          ĐANG TẢI
        </motion.h2>

        {/* Progress bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '300px' }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden"
        >
          <div
            className="h-full bg-black transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </motion.div>

        {/* Percentage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex items-center"
        >
          <span className="text-lg font-medium mr-3 text-black">
            {Math.round(progress)}%
          </span>
          {/* Spinner CSS animation */}
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-black rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;
