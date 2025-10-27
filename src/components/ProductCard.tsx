'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Heart, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    basePrice: number;
    virtualPrice: number;
    images: string[];
    status: string;
    variants?: Array<{
      value: string;
      valueOption: Array<{
        value: string;
        price: number;
        image: string;
      }>;
    }>;
    skus: Array<{
      id: number;
      value: string;
      price: number;
      status: string;
    }>;
  };
  onAddToCart?: (productId: number, skuId: number) => void;
  className?: string;
}

export default function ProductCard({
  product,
  onAddToCart,
  className = '',
}: ProductCardProps) {
  const getDisplayPrice = () => {
    const basePrice = product.basePrice;
    const virtualPrice = product.virtualPrice;

    if (virtualPrice && virtualPrice > basePrice) {
      return {
        originalPrice: virtualPrice,
        discountedPrice: basePrice,
        hasDiscount: true,
        discountAmount: virtualPrice - basePrice,
      };
    }

    return {
      originalPrice: basePrice,
      discountedPrice: basePrice,
      hasDiscount: false,
      discountAmount: 0,
    };
  };

  const priceInfo = getDisplayPrice();
  const isUnavailable = product.status === 'UNAVAILABLE';

  // Mock data for popularity (you can replace with real data)
  const popularity = {
    orders: Math.floor(Math.random() * 500) + 100,
    likes: Math.floor(Math.random() * 200) + 50,
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 animate-fade-in ${className}`}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        {isUnavailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <span className="text-white text-sm font-medium bg-red-500 px-3 py-1 rounded-full">
              Hết hàng
            </span>
          </div>
        )}

        <Image
          src={product.images?.[0] || '/placeholder-food.jpg'}
          alt={product.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />

        {/* Badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            Đặc biệt
          </span>
        </div>

        {/* Like Button */}
        <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Popularity Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span>{popularity.orders} đã đặt</span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {popularity.likes} thích
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          {priceInfo.hasDiscount ? (
            <>
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(priceInfo.discountedPrice)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(priceInfo.originalPrice)}
              </span>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                Giảm {formatCurrency(priceInfo.discountAmount)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(priceInfo.originalPrice)}
            </span>
          )}
        </div>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-2 mb-4">
            {product.variants.map((variant, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {variant.value}:
                </label>
                <div className="flex flex-wrap gap-2">
                  {variant.valueOption.map((option, optIndex) => (
                    <button
                      key={optIndex}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        isUnavailable
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600'
                      }`}
                      disabled={isUnavailable}
                    >
                      {option.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add to Cart Button */}
        <Button
          className="w-full h-10 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
          onClick={() => onAddToCart?.(product.id, product.skus[0]?.id)}
          disabled={isUnavailable}
        >
          <ShoppingCart className="w-4 h-4" />
          Thêm vào giỏ
        </Button>
      </div>
    </div>
  );
}
