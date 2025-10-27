'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const dishes = [
  {
    id: 1,
    name: 'Phở Bò Tái',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    category: 'Món chính',
    isNew: true
  },
  {
    id: 2,
    name: 'Bún Bò Huế',
    price: 75000,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    category: 'Món chính',
    isNew: true
  },
  {
    id: 3,
    name: 'Cơm Tấm Sài Gòn',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
    category: 'Món chính',
    isNew: false
  },
  {
    id: 4,
    name: 'Bánh Xèo',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66773828?w=400&h=300&fit=crop',
    category: 'Món chính',
    isNew: true
  },
  {
    id: 5,
    name: 'Chả Cá Lã Vọng',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
    category: 'Món chính',
    isNew: true
  },
  {
    id: 6,
    name: 'Bún Chả Hà Nội',
    price: 70000,
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d4d0?w=400&h=300&fit=crop',
    category: 'Món chính',
    isNew: false
  },
  {
    id: 7,
    name: 'Gỏi Cuốn',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
    category: 'Khai vị',
    isNew: true
  },
  {
    id: 8,
    name: 'Nem Nướng Nha Trang',
    price: 60000,
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
    category: 'Khai vị',
    isNew: true
  }
];

export default function HorizontalScrollDishes() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if element is in viewport
      const isInView = rect.top < windowHeight && rect.bottom > 0;
      setIsVisible(isInView);

      if (isInView) {
        // Calculate scroll progress within the element
        const elementHeight = rect.height;
        const scrollTop = window.pageYOffset;
        const elementTop = scrollTop + rect.top;
        const elementBottom = elementTop + elementHeight;
        const currentScroll = scrollTop + windowHeight;
        
        const progress = Math.max(0, Math.min(1, (currentScroll - elementTop) / (elementHeight + windowHeight)));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      <div 
        className="flex gap-6 transition-transform duration-1000 ease-out"
        style={{
          transform: isVisible 
            ? `translateX(-${scrollProgress * (dishes.length * 320 - window.innerWidth + 100)}px)`
            : 'translateX(0)'
        }}
      >
        {dishes.map((dish) => (
          <Card key={dish.id} className="flex-shrink-0 w-80 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48 overflow-hidden">
              <Image
                src={dish.image}
                alt={dish.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
              {dish.isNew && (
                <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                  Mới
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg text-gray-800 line-clamp-1">
                  {dish.name}
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">{dish.category}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-yellow-600">
                  {dish.price.toLocaleString('vi-VN')}đ
                </span>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Thêm vào giỏ
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-white/30 rounded-full"></div>
          <div className="w-2 h-2 bg-white/30 rounded-full"></div>
          <div className="w-2 h-2 bg-white/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
