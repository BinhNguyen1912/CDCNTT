'use client';

import React from 'react';
import Image from 'next/image';

interface Category {
  id: number;
  name: string;
  logo: string;
}

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategorySelect: (categoryId: number | null) => void;
  className?: string;
}

export default function CategoryTabs({
  categories,
  selectedCategory,
  onCategorySelect,
  className = '',
}: CategoryTabsProps) {
  return (
    <div
      className={`bg-white border-b border-gray-200 sticky top-[57px] z-10 ${className}`}
    >
      <div className="flex overflow-x-auto px-4 py-3 gap-3 no-scrollbar">
        {/* All Categories Button */}
        <button
          className={`flex flex-col items-center flex-shrink-0 w-16 transition-colors ${
            selectedCategory === null
              ? 'text-red-600'
              : 'text-gray-600 hover:text-red-500'
          }`}
          onClick={() => onCategorySelect(null)}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              selectedCategory === null
                ? 'bg-red-100'
                : 'bg-gray-100 hover:bg-red-50'
            }`}
          >
            <span className="text-lg">🍽️</span>
          </div>
          <span className="text-xs mt-1 font-medium">Tất cả</span>
        </button>

        {/* Category Buttons */}
        {categories.map((category) => (
          <button
            key={category.id}
            className={`flex flex-col items-center flex-shrink-0 w-16 transition-colors ${
              selectedCategory === category.id
                ? 'text-red-600'
                : 'text-gray-600 hover:text-red-500'
            }`}
            onClick={() => onCategorySelect(category.id)}
          >
            <div
              className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center transition-colors ${
                selectedCategory === category.id
                  ? 'bg-red-100'
                  : 'bg-gray-100 hover:bg-red-50'
              }`}
            >
              <Image
                src={category.logo}
                alt={category.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs mt-1 font-medium text-center leading-tight">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
