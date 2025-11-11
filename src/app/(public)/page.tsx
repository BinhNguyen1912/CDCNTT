/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
'use client';

import { useAppStore } from '@/components/app-provider';
// import ProductsPage from '@/components/productsPage';
import Logomarquee from '@/components/logomarquee';
import ParticleView from '@/components/particleText';
import { Button } from '@/components/ui/button';
import { VideoText } from '@/components/video-text';
import { useLoading } from '@/hooks/useLoading';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import SlideInText from '@/components/SlideInText ';
import SlideInView from '@/components/SlideInText ';
import AnimatedImagesWithBg from '@/components/animatedImagesWithBg';
import BananaTreeSection from '@/components/bananaTreeSection';
import BananaTreeAnimation from '@/components/bananaTreeAnimation';
import ClientOnly from '@/components/ClientOnly';
import AboutSection from '@/components/AboutSection';

export default function Home() {
  const { isLoading, progress } = useLoading();
  const isAuth = useAppStore((state) => state.isAuth);

  return (
    <div className="w-full">
      <section
        className="relative block w-screen overflow-hidden left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-6 md:-mt-8"
        style={{
          backgroundImage: `url('https://aban.com.vn/wp-content/uploads/2023/04/Menu-3-1-1.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay to improve text contrast */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Centered banner text (two lines) */}
        <div className="relative min-h-[100vh] flex items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-white text-4xl md:text-6xl font-bold tracking-wide drop-shadow-lg">
              ẨM THỰC VIỆT NAM
            </h1>
            <p className="mt-3 md:mt-4 text-white/90 text-base md:text-lg tracking-wide drop-shadow">
              'Hương vị truyền thống, tinh hoa đất Việt'
            </p>
          </div>
        </div>
      </section>
      <ClientOnly>
        <AnimatedImagesWithBg />
      </ClientOnly>

      <ClientOnly>
        <BananaTreeSection />
      </ClientOnly>
      <ClientOnly>
        <Logomarquee />
      </ClientOnly>
    </div>
  );
}
