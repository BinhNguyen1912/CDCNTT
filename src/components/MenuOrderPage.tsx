'use client';

import React, { useState, useMemo } from 'react';
import { useGetProducts } from '@/app/queries/useProducts';
import CategoryTabs from './CategoryTabs';
import PromotionBanner from './PromotionBanner';
import ProductGrid from './ProductGrid';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  logo: string;
}

interface CartItem {
  productId: number;
  skuId: number;
  quantity: number;
  productName: string;
  price: number;
}

// Mock categories data
const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Lẩu ngon',
    logo: 'https://i.pinimg.com/736x/ca/ff/dc/caffdc755a4396b4c99da3da83e62796.jpg',
  },
  {
    id: 8,
    name: 'BestSeller',
    logo: 'https://i.pinimg.com/1200x/09/fd/e2/09fde2dd802d4a07b7c0c281c67f93c2.jpg',
  },
  {
    id: 9,
    name: 'Nước giải khát',
    logo: 'https://i.pinimg.com/1200x/09/fd/e2/09fde2dd802d4a07b7c0c281c67f93c2.jpg',
  },
  {
    id: 10,
    name: 'Bò Quê',
    logo: 'https://i.pinimg.com/1200x/09/fd/e2/09fde2dd802d4a07b7c0c281c67f93c2.jpg',
  },
  {
    id: 24,
    name: 'Bò Tươi',
    logo: 'http://res.cloudinary.com/diseg6gh7/image/upload/v1757844916/Ecommers/zuvewkpqa6jlzzbirmof.jpg',
  },
  {
    id: 25,
    name: 'Bánh quê',
    logo: 'http://res.cloudinary.com/diseg6gh7/image/upload/v1757845014/Ecommers/evpsicnvqumi0nw1rnan.jpg',
  },
  {
    id: 27,
    name: 'Tráng Miệng',
    logo: 'http://res.cloudinary.com/diseg6gh7/image/upload/v1757850954/Ecommers/i89lel6vpkmla9215lol.jpg',
  },
  {
    id: 29,
    name: 'Già Tiềm',
    logo: 'http://res.cloudinary.com/diseg6gh7/image/upload/v1758018859/Ecommers/c1ykhge4w3pvnhfghycz.png',
  },
  {
    id: 33,
    name: 'Cơm Quê',
    logo: 'http://res.cloudinary.com/diseg6gh7/image/upload/v1758112121/Ecommers/pngqm4coauu4phgskw0i.png',
  },
  {
    id: 34,
    name: 'Phở',
    logo: 'http://res.cloudinary.com/diseg6gh7/image/upload/v1758112321/Ecommers/ncrjzwozourl1ilejjdb.jpg',
  },
];

export default function MenuOrderPage() {
  const { data, isLoading } = useGetProducts();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const products = useMemo(() => data?.data || [], [data]);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    // Assuming products have categoryId field - adjust based on your API
    return products.filter((product) => product.categoryId === selectedCategory);
  }, [products, selectedCategory]);

  const handleAddToCart = (productId: number, skuId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const sku = product.skus.find(s => s.id === skuId);
    if (!sku) return;

    setCartItems(prev => {
      const existingItem = prev.find(item => 
        item.productId === productId && item.skuId === skuId
      );

      if (existingItem) {
        return prev.map(item =>
          item.productId === productId && item.skuId === skuId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, {
        productId,
        skuId,
        quantity: 1,
        productName: product.name,
        price: sku.price,
      }];
    });
  };

  const handleRemoveFromCart = (productId: number, skuId: number) => {
    setCartItems(prev => 
      prev.filter(item => !(item.productId === productId && item.skuId === skuId))
    );
  };

  const handleUpdateQuantity = (productId: number, skuId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId, skuId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId && item.skuId === skuId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">
            Nhà hàng AI - Cửa hàng
          </h1>
          <div className="flex items-center gap-2">
            <button
              className="relative p-2 text-gray-600 hover:text-red-600 transition-colors"
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* DEMO Banner */}
      <div className="bg-purple-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">DEMO</span>
          <span className="text-sm">Trải nghiệm đặt món thông minh tại bàn</span>
        </div>
        <button className="text-sm underline">► Bỏ qua</button>
      </div>

      {/* Promotion Banner */}
      <PromotionBanner 
        promotions={[]} 
        onAddToCart={(promotionId) => {
          console.log('Add promotion to cart:', promotionId);
        }}
      />

      {/* Category Tabs */}
      <CategoryTabs
        categories={mockCategories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Product Grid */}
      <div className="px-4 py-6">
        <ProductGrid
          products={filteredProducts}
          onAddToCart={handleAddToCart}
          loading={isLoading}
        />
      </div>

      {/* Fixed Bottom Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <Button
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
            onClick={() => setShowCart(true)}
          >
            <div className="flex justify-between items-center w-full">
              <span>Giỏ hàng · {totalItems} món</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
          </Button>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Giỏ hàng</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.skuId}`} className="flex items-center gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.productName}</h3>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.skuId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.skuId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Tổng cộng:</span>
                <span className="text-lg font-bold text-red-600">{formatCurrency(totalPrice)}</span>
              </div>
              <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg">
                Đặt hàng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
