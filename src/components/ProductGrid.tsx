'use client';

import React from 'react';
import ProductCard from './ProductCard';

interface Product {
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
}

interface ProductGridProps {
  products: Product[];
  onAddToCart?: (productId: number, skuId: number) => void;
  className?: string;
  loading?: boolean;
}

export default function ProductGrid({ 
  products, 
  onAddToCart, 
  className = '',
  loading = false 
}: ProductGridProps) {
  if (loading) {
    return (
      <div className={`grid-responsive ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="text-gray-400 text-6xl mb-4">🍽️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có sản phẩm nào</h3>
        <p className="text-gray-500 text-center">
          Hiện tại chưa có sản phẩm nào trong danh mục này.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid-responsive ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}