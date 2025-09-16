/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
// import dishesApiRequest from '@/apiRequest/dishes';
// import { DishStatus } from '@/app/constants/type';
// import { DishListResType } from '@/app/schemaValidations/dish.schema';
import { DemoSkiper16 } from '@/components/demo';
import { LogoCloud } from '@/components/logo-cloud';
import { Button } from '@/components/ui/button';
// import { formatCurrency } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  // let dishList: DishListResType['data'] = [];
  // const {
  //   payload: { data },
  // } = await dishesApiRequest.getDishes();
  // dishList = data;

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
              // autoPlay
              // loop
              alt="sa"
              fill
              src="https://cdn.dribbble.com/userupload/44179470/file/original-cddeadb84b77c272bba92f932163ea2a.gif"
            ></Image>
          </div>
        </div>
      </section>
      {/* <div className="relative">
        <span className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></span>
        <Image
          src="https://i.pinimg.com/736x/8a/ef/90/8aef90b577b6280fe22445333657112a.jpg"
          width={400}
          height={200}
          quality={100}
          alt="Banner"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="z-10 relative py-10 md:py-20 px-4 sm:px-10 md:px-20">
          <h1 className="text-center text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold">
            Nhà hàng Big Boy
          </h1>
          <p className="text-center text-sm sm:text-base mt-4">
            Vị ngon, trọn khoảnh khắc
          </p>
        </div>
      </div> */}
      <section className="space-y-10 py-16 my-20">
        <h2 className="text-center text-2xl font-bold">Đa dạng các món ăn</h2>
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {dishList &&
            dishList.map((dish) => (
              <Link
                href={`/dishes/${dish.id}`}
                className="flex gap-4 w"
                key={dish.id}
              >
                <div className="flex-shrink-0">
                  <Image
                    src={`${dish.image}`}
                    className="object-cover w-[150px] h-[150px] rounded-md"
                    alt={dish.name}
                    width={200}
                    height={150}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">{dish.name}</h3>
                  <p className="">{dish.description}</p>
                  <p className="font-semibold">{formatCurrency(dish.price)}</p>
                </div>
              </Link>
            ))}
        </div> */}
      </section>
      <DemoSkiper16 />

      <footer>
        <LogoCloud />
      </footer>
    </div>

    // <main className="overflow-x-hidden">
    //   <section>
    //     <div className="py-24 md:pb-32 lg:pb-36 lg:pt-72">
    //       <div className="relative mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12">
    //         <div className="mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left">
    //           <h1 className="mt-8 max-w-2xl text-balance text-5xl md:text-6xl lg:mt-16 xl:text-7xl">
    //             Build 10x Faster with NS
    //           </h1>
    //           <p className="mt-8 max-w-2xl text-balance text-lg">
    //             Highly customizable components for building modern websites and
    //             applications you mean it.
    //           </p>

    //           <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
    //             <Button
    //               asChild
    //               size="lg"
    //               className="h-12 rounded-full pl-5 pr-3 text-base"
    //             >
    //               <Link href="#link">
    //                 <span className="text-nowrap">Start Building</span>
    //                 <ChevronRight className="ml-1" />
    //               </Link>
    //             </Button>
    //             <Button
    //               key={2}
    //               asChild
    //               size="lg"
    //               variant="ghost"
    //               className="h-12 rounded-full px-5 text-base hover:bg-zinc-950/5 dark:hover:bg-white/5"
    //             >
    //               <Link href="#link">
    //                 <span className="text-nowrap">Request a demo</span>
    //               </Link>
    //             </Button>
    //           </div>
    //         </div>
    //       </div>
    //       <div className="aspect-2/3 absolute inset-1 -z-10 overflow-hidden rounded-3xl border border-black/10 lg:aspect-video lg:rounded-[3rem] dark:border-white/5">
    //         <video
    //           autoPlay
    //           loop
    //           className="size-full object-cover opacity-50 invert dark:opacity-35 dark:invert-0 dark:lg:opacity-75"
    //           src="https://cdn.dribbble.com/userupload/44179470/file/original-cddeadb84b77c272bba92f932163ea2a.gif"
    //         ></video>
    //       </div>
    //     </div>
    //   </section>

    //   <div className="w-full space-y-4">
    //     <div className="relative">
    //       <span className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></span>
    //       <Image
    //         src="https:i.pinimg.com/736x/8a/ef/90/8aef90b577b6280fe22445333657112a.jpg"
    //         width={400}
    //         height={200}
    //         quality={100}
    //         alt="Banner"
    //         className="absolute top-0 left-0 w-full h-full object-cover"
    //       />
    //       <div className="z-10 relative py-10 md:py-20 px-4 sm:px-10 md:px-20">
    //         <h1 className="text-center text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold">
    //           Nhà hàng Big Boy
    //         </h1>
    //         <p className="text-center text-sm sm:text-base mt-4">
    //           Vị ngon, trọn khoảnh khắc
    //         </p>
    //       </div>
    //     </div>
    //     <section className="space-y-10 py-16">
    //       <h2 className="text-center text-2xl font-bold">Đa dạng các món ăn</h2>
    //       <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
    //         {dishList &&
    //           dishList.map((dish) => (
    //             <Link
    //               href={`/dishes/${dish.id}`}
    //               className="flex gap-4 w"
    //               key={dish.id}
    //             >
    //               <div className="flex-shrink-0">
    //                 <Image
    //                   src={`${dish.image}`}
    //                   className="object-cover w-[150px] h-[150px] rounded-md"
    //                   alt={dish.name}
    //                   width={200}
    //                   height={150}
    //                 />
    //               </div>
    //               <div className="space-y-1">
    //                 <h3 className="text-xl font-semibold">{dish.name}</h3>
    //                 <p className="">{dish.description}</p>
    //                 <p className="font-semibold">
    //                   {formatCurrency(dish.price)}
    //                 </p>
    //               </div>
    //             </Link>
    //           ))}
    //       </div>
    //     </section>
    //     <DemoSkiper16 />

    //     <footer>
    //       <LogoCloud />
    //     </footer>
    //   </div>
    // </main>
  );
}
