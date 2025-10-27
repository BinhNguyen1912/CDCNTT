// components/AnimatedImagesOnBg.jsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const AnimatedImagesOnBg = () => {
  const menuCategories = [
    {
      title: 'Combo',
      description: 'Các gói combo tiết kiệm',
      image: 'https://backimthang.vn/wp-content/uploads/2024/04/menu1.jpg',
      items: ['Nem rán', 'Chả giò', 'Món khai vị', 'Thịt thái lát'],
    },
    {
      title: 'Gọi món',
      description: 'Menu à la carte',
      image: 'https://backimthang.vn/wp-content/uploads/2024/04/menu2.jpg',
      items: ['Gà hầm', 'Lẩu', 'Bánh bao', 'Há cảo'],
    },
    {
      title: 'Các món nên thử',
      description: 'Đặc sản được gợi ý',
      image: 'https://backimthang.vn/wp-content/uploads/2024/04/menu3.jpg',
      items: ['Nước giải khát', 'Trái cây', 'Gia vị', 'Đồ uống'],
    },
  ];

  return (
    <div className="relative w-screen -ml-[50vw] left-1/2 right-1/2 -mr-[50vw] py-20">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="https://backimthang.vn/wp-content/themes/bac-kim-thang/assets/images/bg-menu.png"
          alt="Background"
          className="object-cover"
          fill
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-amber-800/30" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-amber-900 mb-4 font-serif">
              Thực đơn
            </h1>
            <p className="text-xl text-amber-800 mb-6">
              Đi đâu để ăn món Việt khắp ba miền?
            </p>
            <p className="text-lg text-amber-700 max-w-4xl mx-auto leading-relaxed">
              B'Restaurant phục vụ các món ngon truyền thống, đảm bảo Vệ Sinh An
              Toàn Thực Phẩm, khâu tuyển chọn nguyên liệu tươi ngon, quy trình
              kiểm định nghiêm ngặt để mang đến trải nghiệm hoàn hảo nhất, tuyệt
              đỉnh nhất cho mỗi bữa ăn.
            </p>
          </motion.div>
        </div>

        {/* Menu Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {menuCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: index * 0.2,
                ease: 'easeOut',
              }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
              className="group relative cursor-pointer"
            >
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl bg-amber-50">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 30vw"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/80 via-amber-800/40 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                  <p className="text-amber-100 mb-4">{category.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {category.items.map((item, itemIndex) => (
                      <span
                        key={itemIndex}
                        className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View Menu Button */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Xem menu
            </Button>
          </motion.div>
        </div>

        {/* New Dishes Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4 font-serif">
              Các món mới
            </h2>
            <p className="text-lg text-amber-700 max-w-3xl mx-auto">
              B'Restaurant là điểm đến lý tưởng cho những ai muốn khám phá hương
              vị đặc sắc của ẩm thực ba miền. Không chỉ trải nghiệm không gian
              ấm cúng, chúng tôi tự hào mang đến cho bạn và gia đình bữa ăn đậm
              đà bản sắc ẩm thực Việt Nam.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedImagesOnBg;
