'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface PromotionItem {
  id: number;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  image?: string;
}

interface PromotionBannerProps {
  promotions: PromotionItem[];
  onAddToCart?: (promotionId: number) => void;
  className?: string;
}

export default function PromotionBanner({
  promotions,
  onAddToCart,
  className = '',
}: PromotionBannerProps) {
  // Mock promotions data if none provided
  const defaultPromotions: PromotionItem[] = [
    {
      id: 1,
      name: 'Combo đặc biệt',
      originalPrice: 76000,
      discountedPrice: 63000,
    },
    {
      id: 2,
      name: 'Ưu đãi hôm nay',
      originalPrice: 72000,
      discountedPrice: 60000,
    },
  ];

  const displayPromotions =
    promotions.length > 0 ? promotions : defaultPromotions;

  return (
    <div
      className={`bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 ${className}`}
    >
      <div className="flex gap-4">
        {displayPromotions.slice(0, 2).map((promotion) => (
          <div
            key={promotion.id}
            className="flex-1 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">
                  {promotion.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(promotion.discountedPrice)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(promotion.originalPrice)}
                  </span>
                </div>
                <div className="text-xs text-green-600 font-medium mt-1">
                  Tiết kiệm{' '}
                  {formatCurrency(
                    promotion.originalPrice - promotion.discountedPrice,
                  )}
                </div>
              </div>
              <Button
                className="w-12 h-12 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl flex items-center justify-center p-0"
                onClick={() => onAddToCart?.(promotion.id)}
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
