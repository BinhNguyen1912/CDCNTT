/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import ReactLenis from 'lenis/react';
import { Badge } from 'lucide-react';
import React, { useRef } from 'react';

const projects = [
  {
    title: 'Bánh mì',
    src: '/images/lummi/img8.png',
  },
  {
    title: 'Cà phê',
    src: '/images/lummi/img14.png',
  },
  {
    title: 'Cà phê',
    src: '/images/lummi/img10.png',
  },
  {
    title: 'Cà phê',
    src: '/images/lummi/img15.png',
  },
  {
    title: 'Cà phê',
    src: '/images/lummi/img12.png',
  },
];

const StickyCard_001 = ({
  i,
  title,
  src,
  progress,
  range,
  targetScale,
}: {
  i: number;
  title: string;
  src: string;
  progress: any;
  range: [number, number];
  targetScale: number;
}) => {
  const container = useRef<HTMLDivElement>(null);

  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className="sticky top-0 flex items-center justify-center"
    >
      <motion.div
        style={{
          scale,
          top: `calc(-5vh + ${i * 20 + 250}px)`,
        }}
        className="rounded-4xl relative -top-1/4 flex h-[300px] w-[800px] origin-top flex-col overflow-hidden"
      >
        <div className="flex h-full w-full justify-between items-center">
          <img
            src={src}
            alt={title}
            className="h-full w-2/3 object-cover rounded-xl"
          />
          <div>
            <Badge>{title}</Badge>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Skiper16 = () => {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <ReactLenis root>
      <main
        ref={container}
        className="relative flex w-full flex-col items-center justify-center pb-[100vh] pt-[50vh]"
      >
        <div className="absolute left-1/2 top-[10%] grid -translate-x-1/2 content-start justify-items-center gap-6 text-center">
          <span className="after:from-background after:to-foreground relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:content-['']">
            scroll down to see card stack
          </span>
        </div>
        {projects.map((project, i) => {
          const targetScale = Math.max(
            0.5,
            1 - (projects.length - i - 1) * 0.1
          );
          return (
            <StickyCard_001
              key={`p_${i}`}
              i={i}
              {...project}
              progress={scrollYProgress}
              range={[i * 0.25, 1]}
              targetScale={targetScale}
              title={project.title}
            />
          );
        })}
      </main>
    </ReactLenis>
  );
};

export { Skiper16, StickyCard_001 };
