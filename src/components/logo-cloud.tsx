/* eslint-disable @next/next/no-img-element */
import { InfiniteSlider } from '../../components/motion-primitives/infinite-slider';
import { ProgressiveBlur } from '../../components/motion-primitives/progressive-blur';

export const LogoCloud = () => {
  return (
    <section className="bg-background py-16 md:py-32">
      <div className="relative m-auto max-w-6xl px-6">
        <div className="flex flex-col items-center md:flex-row">
          {/* Text giới thiệu */}
          <div className="inline md:max-w-44 md:border-r md:pr-6">
            <p className="text-end text-sm text-muted-foreground">
              Powering the best teams
            </p>
          </div>

          {/* Slider */}
          <div className="relative py-6 md:w-[calc(100%-11rem)]">
            <InfiniteSlider gap={80} speed={40} speedOnHover={20}>
              <img
                src="https://html.tailus.io/blocks/customers/nvidia.svg"
                alt="Nvidia Logo"
                className="h-5 mx-8 dark:invert"
                width={200}
                height={200}
              />
              <img
                src="https://i.pinimg.com/736x/9d/67/4b/9d674bb6792df19c589587e0956ab9c3.jpg"
                alt="Column Logo"
                className="h-5 mx-8 dark:invert"
              />
              <img
                src="https://i.pinimg.com/736x/9d/67/4b/9d674bb6792df19c589587e0956ab9c3.jpg"
                alt="GitHub Logo"
                className="h-5 mx-8 dark:invert"
              />
              <img
                src="https://i.pinimg.com/736x/9d/67/4b/9d674bb6792df19c589587e0956ab9c3.jpg"
                alt="Nike Logo"
                className="h-6 mx-8 dark:invert"
              />
              <img
                src="https://i.pinimg.com/736x/9d/67/4b/9d674bb6792df19c589587e0956ab9c3.jpg"
                alt="Lemon Squeezy Logo"
                className="h-6 mx-8 dark:invert"
              />
              <img
                src="https://i.pinimg.com/736x/9d/67/4b/9d674bb6792df19c589587e0956ab9c3.jpg"
                alt="Laravel Logo"
                className="h-5 mx-8 dark:invert"
              />
              <img
                src="https://i.pinimg.com/736x/9d/67/4b/9d674bb6792df19c589587e0956ab9c3.jpg"
                alt="Lilly Logo"
                className="h-7 mx-8 dark:invert"
              />
              <img
                src="https://i.pinimg.com/736x/9d/67/4b/9d674bb6792df19c589587e0956ab9c3.jpg"
                alt="OpenAI Logo"
                className="h-6 mx-8 dark:invert"
              />
            </InfiniteSlider>

            {/* Overlay mờ hai bên */}
            <ProgressiveBlur
              direction="left"
              blurLayers={6}
              blurIntensity={0.3}
              className="absolute inset-y-0 left-0 w-24"
            />
            <ProgressiveBlur
              direction="right"
              blurLayers={6}
              blurIntensity={0.3}
              className="absolute inset-y-0 right-0 w-24"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
