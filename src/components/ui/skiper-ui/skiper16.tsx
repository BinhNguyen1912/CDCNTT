// /* eslint-disable @next/next/no-img-element */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// 'use client';

// import { motion, useTransform } from 'framer-motion';
// import React, { useRef } from 'react';
// import { Badge } from 'lucide-react';

// // Card riêng
// export const StickyCard_001 = ({
//   i,
//   title,
//   src,
//   progress,
//   range,
//   targetScale,
// }: {
//   i: number;
//   title: string;
//   src: string;
//   progress: any;
//   range: [number, number];
//   targetScale: number;
// }) => {
//   const container = useRef<HTMLDivElement>(null);
//   const scale = useTransform(progress, range, [1, targetScale]);

//   return (
//     <div
//       ref={container}
//       className="sticky top-0 flex items-center justify-center"
//     >
//       <motion.div
//         style={{
//           scale,
//           top: `calc(-5vh + ${i * 20 + 250}px)`,
//         }}
//         className="rounded-4xl relative -top-1/4 flex h-[300px] w-[800px] origin-top flex-col overflow-hidden"
//       >
//         <div className="flex h-full w-full justify-between items-center">
//           <img
//             src={src}
//             alt={title}
//             className="h-full w-2/3 object-cover rounded-xl"
//           />
//           <div>
//             <Badge>{title}</Badge>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// // Component demo gốc (có thể bỏ nếu không cần)
// export const Skiper16 = ({
//   projects,
// }: {
//   projects: { title: string; src: string }[];
// }) => {
//   return (
//     <main className="relative flex w-full flex-col items-center justify-center pb-[100vh] pt-[50vh]">
//       {projects.map((project, i) => {
//         const targetScale = Math.max(0.5, 1 - (projects.length - i - 1) * 0.1);
//         return (
//           <StickyCard_001
//             key={`p_${i}`}
//             i={i}
//             {...project}
//             progress={null} // truyền vào từ ngoài nếu muốn scroll sync
//             range={[i * 0.25, 1]}
//             targetScale={targetScale}
//           />
//         );
//       })}
//     </main>
//   );
// };

/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { motion, useTransform } from 'framer-motion';
import React, { useRef } from 'react';
import { Badge, ShoppingCart, Star, Heart, ArrowRight } from 'lucide-react';

// Card riêng
export const StickyCard_001 = ({
  i,
  title,
  src,
  progress,
  range,
  targetScale,
  description,
  price,
  rating,
  category,
}: {
  i: number;
  title: string;
  src: string;
  progress: any;
  range: [number, number];
  targetScale: number;
  description?: string;
  price?: number;
  rating?: number;
  category?: string;
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
        className="rounded-4xl relative -top-1/4 flex h-[350px] w-[900px] origin-top flex-col overflow-hidden bg-white shadow-2xl"
      >
        <div className="flex h-full w-full">
          {/* Phần hình ảnh */}
          <div className="relative w-2/5 overflow-hidden">
            <img
              src={src}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-white text-black px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                {category || 'Bestseller'}
              </Badge>
            </div>
            <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
              <Heart size={18} className="text-rose-500" />
            </button>
          </div>

          {/* Phần thông tin sản phẩm */}
          <div className="flex flex-col w-3/5 p-8 justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={`${star <= (rating || 4.5) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  ({rating || 4.5})
                </span>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {description ||
                  'Sản phẩm cao cấp với thiết kế hiện đại và chất liệu bền bỉ. Hoàn hảo cho mọi không gian sống.'}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500 line-through">
                  ${(price || 199) * 1.2}
                </span>
                <span className="text-2xl font-bold text-gray-900 ml-2">
                  ${price || 199}
                </span>
              </div>

              <div className="flex space-x-3">
                <button className="flex items-center justify-center px-5 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-medium">
                  <ShoppingCart size={16} className="mr-2" />
                  Thêm vào giỏ
                </button>
                <button className="flex items-center justify-center p-3 border border-gray-300 rounded-full hover:border-gray-500 transition-colors">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Component demo gốc (có thể bỏ nếu không cần)
export const Skiper16 = ({
  projects,
}: {
  projects: {
    title: string;
    src: string;
    description?: string;
    price?: number;
    rating?: number;
    category?: string;
  }[];
}) => {
  return (
    <main className="relative flex w-full flex-col items-center justify-center pb-[100vh] pt-[50vh]">
      {projects.map((project, i) => {
        const targetScale = Math.max(0.5, 1 - (projects.length - i - 1) * 0.1);
        return (
          <StickyCard_001
            key={`p_${i}`}
            i={i}
            {...project}
            progress={null}
            range={[i * 0.25, 1]}
            targetScale={targetScale}
          />
        );
      })}
    </main>
  );
};
