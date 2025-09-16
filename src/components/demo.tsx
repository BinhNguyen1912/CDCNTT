'use client';
import { StickyCard_001 } from '@/components/ui/skiper-ui/skiper16';
import { useScroll } from 'framer-motion';
import { useRef } from 'react';

const projects = [
  {
    title: 'Your Project 1',
    src: 'https://i.pinimg.com/1200x/06/e2/76/06e2765a8a493fdab95ed163ae4bfc00.jpg',
  },
  {
    title: 'Your Project 2',
    src: 'https://i.pinimg.com/736x/7a/cf/a2/7acfa2833fc520a3a8c562698da9ed77.jpg',
  },
  {
    title: 'Your Project 2',
    src: 'https://i.pinimg.com/736x/7a/cf/a2/7acfa2833fc520a3a8c562698da9ed77.jpg',
  },
  {
    title: 'Your Project 2',
    src: 'https://i.pinimg.com/736x/7a/cf/a2/7acfa2833fc520a3a8c562698da9ed77.jpg',
  },
  // Add more projects as needed
];

export const DemoSkiper16 = () => {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <main
      ref={container}
      className="relative flex w-full flex-col items-center justify-center bg-black/30 pb-[50vh]"
    >
      {projects.map((project, i) => {
        const targetScale = Math.max(0.5, 1 - (projects.length - i - 1) * 0.1);
        return (
          <StickyCard_001
            key={`p_${i}`}
            i={i}
            {...project}
            progress={scrollYProgress}
            range={[i * 0.25, 1]}
            targetScale={targetScale}
          />
        );
      })}
    </main>
  );
};
