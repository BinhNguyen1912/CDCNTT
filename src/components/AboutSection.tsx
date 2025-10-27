'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const AboutSection = () => {
  return (
    <div className="relative w-screen -ml-[50vw] left-1/2 right-1/2 -mr-[50vw] py-24">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Pattern overlay - bạn có thể thay bằng ảnh pattern riêng */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-gray-300 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 right-1/3 w-28 h-28 bg-gray-300 rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center min-h-[80vh]">
          {/* Left Section - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white space-y-10 px-4 lg:px-8"
          >
            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight text-white">
                VỀ
              </h1>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-gray-300 leading-tight">
                BẮC KIM THANG
              </h2>
            </div>

            {/* Content Paragraphs */}
            <div className="space-y-6 text-lg lg:text-xl leading-relaxed max-w-2xl">
              <p className="text-gray-200">
                "Bắc Kim Thang là kỹ thuật trồng các loại cây cà-lang-bí của
                người dân Tây Nam Bộ". Quả cà, củ khoai lang và quả bí rợ.
              </p>

              <p className="text-gray-200">
                Bắc Kim Thang là hình ảnh ẩn dụ cho tình cảm keo sơn khắng khít
                của người Việt nói chung và trong Gia Đình Việt nói riêng.
              </p>

              <p className="text-gray-200">
                Bắc Kim Thang muốn mang đến các món ăn với hương vị hạnh phúc để
                kết nối tình yêu thương của con người và văn hoá Việt trong xã
                hội Việt Nam hiện đại và đến với con người và văn hoá khắp nơi
                trên thế giới.
              </p>
            </div>

            {/* Call to Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-4"
            >
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 px-10 py-5 text-lg font-semibold rounded-xl border-2 border-white hover:border-gray-200 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Tìm hiểu thêm
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Section - Restaurant Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative px-4 lg:px-8"
          >
            <div className="relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
              {/* Placeholder for restaurant image - bạn thay link ảnh vào đây */}
              <Image
                src="https://backimthang.vn/wp-content/themes/bac-kim-thang/assets/images/bgabout.jpg"
                alt="Nhà hàng Bắc Kim Thang"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Overlay for better text contrast if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>

            {/* Decorative elements */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"
            />

            <motion.div
              animate={{
                y: [0, 10, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="absolute -bottom-4 -left-4 w-16 h-16 bg-gray-300/20 rounded-full blur-xl"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
