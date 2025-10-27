'use client';

import { motion } from 'framer-motion';
import BananaTreeAnimation from './bananaTreeAnimation';

const BananaTreeSection = () => {
  return (
    <section className="relative w-screen overflow-hidden left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-white min-h-screen flex items-center">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left side - Banana Tree Animation */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <BananaTreeAnimation
              src="https://i.pinimg.com/1200x/7e/b5/c2/7eb5c2556528a5eec40baff9a5ecf628.jpg"
              alt="Cây chuối truyền thống Việt Nam"
              className="rounded-lg shadow-2xl"
            />
          </motion.div>

          {/* Right side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 space-y-6"
          >
            <div className="space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-gray-800 tracking-wide"
              >
                Hương Vị Truyền Thống
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
                className="w-16 h-1 bg-gradient-to-r from-green-600 to-yellow-500 rounded-full"
              />

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                viewport={{ once: true }}
                className="text-lg text-gray-600 leading-relaxed"
              >
                Từ những cánh đồng lúa xanh bát ngát đến những vườn chuối trĩu
                quả, Việt Nam mang đến những nguyên liệu tươi ngon nhất cho từng
                món ăn truyền thống.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                viewport={{ once: true }}
                className="text-base text-gray-500 leading-relaxed"
              >
                Mỗi món ăn đều kể một câu chuyện về văn hóa, lịch sử và tình yêu
                của người Việt dành cho ẩm thực quê hương.
              </motion.p>
            </div>

            {/* Feature points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              viewport={{ once: true }}
              className="space-y-3 pt-4"
            >
              {[
                'Nguyên liệu tươi ngon từ vùng miền',
                'Công thức truyền thống được bảo tồn',
                'Hương vị đậm đà, đặc trưng Việt Nam',
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                  <span className="text-gray-600">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BananaTreeSection;
