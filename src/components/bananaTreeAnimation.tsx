'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface BananaTreeAnimationProps {
  src: string;
  alt?: string;
  className?: string;
}

const BananaTreeAnimation = ({
  src,
  alt = 'Banana Tree',
  className = '',
}: BananaTreeAnimationProps) => {
  return (
    <div
      className={`relative w-full h-[400px] md:h-[600px] overflow-hidden ${className}`}
    >
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{
          duration: 1.2,
          ease: 'easeOut',
          delay: 0.2,
        }}
        className="absolute left-0 top-0 h-full overflow-hidden w-full"
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-left"
          sizes="50vw"
        />
      </motion.div>
    </div>
  );
};

export default BananaTreeAnimation;
