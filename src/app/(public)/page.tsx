/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
'use client';

import { DemoSkiper16 } from '@/components/demo';
import LoadingScreen from '@/components/LoadingScreen';
import { LogoCloud } from '@/components/logo-cloud';
import { Button } from '@/components/ui/button';
import { useLoading } from '@/hooks/useLoading';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const { isLoading, progress } = useLoading();

  if (isLoading) {
    return <LoadingScreen progress={progress} />;
  }

  return (
    <div className="w-full space-y-4">
      <section>
        <div className="py-40 md:pb-32 lg:pb-40">
          <div className="relative mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12">
            <div className="mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left">
              <h1 className="mt-8 max-w-2xl text-balance text-5xl md:text-6xl lg:mt-16 xl:text-7xl">
                Binh Nguyen
              </h1>
              <p className="mt-8 max-w-2xl text-balance text-lg">RESTAURENT</p>

              <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full pl-5 pr-3 text-base"
                >
                  <Link href="#link">
                    <span className="text-nowrap">Start Building</span>
                    <ChevronRight className="ml-1" />
                  </Link>
                </Button>
                <Button
                  key={2}
                  asChild
                  size="lg"
                  variant="ghost"
                  className="h-12 rounded-full px-5 text-base hover:bg-zinc-950/5 dark:hover:bg-white/5"
                >
                  <Link href="#link">
                    <span className="text-nowrap">Request a demo</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="aspect-2/3 absolute inset-1 -z-10 overflow-hidden rounded-3xl border border-black/10 lg:aspect-video lg:rounded-[3rem] dark:border-white/5">
            <Image
              alt="sa"
              fill
              src="https://cdn.dribbble.com/userupload/44179470/file/original-cddeadb84b77c272bba92f932163ea2a.gif"
            />
          </div>
        </div>
      </section>

      <section className="space-y-10 py-16 my-20">
        <h2 className="text-center text-2xl font-bold">Đa dạng các món ăn</h2>
        {/* Phần dishes list đã được comment lại */}
      </section>

      <DemoSkiper16 />
      <footer>
        <LogoCloud />
      </footer>
    </div>
  );
}
