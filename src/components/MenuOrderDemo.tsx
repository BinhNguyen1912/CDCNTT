'use client';

import React, { useState, useMemo } from 'react';
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

interface Product {
  id: number;
  name: string;
  basePrice: number;
  virtualPrice: number;
  images: string[];
  status: string;
  categoryId?: number;
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

interface CartItem {
  productId: number;
  skuId: number;
  quantity: number;
  productName: string;
  price: number;
}

// Mock data based on your JSON
const mockProducts: Product[] = [
  {
    id: 17,
    name: "Cơm Quê Dượng Bầu",
    basePrice: 140000,
    virtualPrice: 150000,
    status: "ACTIVE",
    categoryId: 33,
    images: [
      "http://res.cloudinary.com/diseg6gh7/image/upload/v1759655474/Ecommers/jhk4xpztcuu2lnczbvuf.jpg"
    ],
    variants: [
      {
        value: "Phần",
        valueOption: [
          {
            value: "1 người",
            price: 140000,
            image: ""
          },
          {
            value: "gia đình",
            price: 160000,
            image: ""
          }
        ]
      }
    ],
    skus: [
      {
        id: 33,
        value: "1 người",
        price: 140000,
        status: "AVAILABLE"
      },
      {
        id: 34,
        value: "gia đình",
        price: 160000,
        status: "AVAILABLE"
      }
    ]
  },
  {
    id: 19,
    name: "Mì Quảng",
    basePrice: 130000,
    virtualPrice: 140000,
    status: "ACTIVE",
    categoryId: 34,
    images: [
      "http://res.cloudinary.com/diseg6gh7/image/upload/v1759655458/Ecommers/gnhsgcudgv84sxdzvgn7.jpg"
    ],
    variants: [
      {
        value: "Phần",
        valueOption: [
          {
            value: "Đặc biệt",
            price: 300000,
            image: ""
          },
          {
            value: "Bình Thường",
            price: 400000,
            image: ""
          }
        ]
      }
    ],
    skus: [
      {
        id: 36,
        value: "Đặc biệt",
        price: 300000,
        status: "AVAILABLE"
      },
      {
        id: 37,
        value: "Bình Thường",
        price: 400000,
        status: "AVAILABLE"
      }
    ]
  },
  {
    id: 20,
    name: "Phở Gà",
    basePrice: 40000,
    virtualPrice: 50000,
    status: "ACTIVE",
    categoryId: 34,
    images: [
      "http://res.cloudinary.com/diseg6gh7/image/upload/v1759655293/Ecommers/yk8tlocapzhvhd3bzan8.jpg"
    ],
    variants: [
      {
        value: "Phần",
        valueOption: [
          {
            value: "Đặc Biệt",
            price: 45000,
            image: ""
          },
          {
            value: "Bình Thường",
            price: 40000,
            image: ""
          }
        ]
      }
    ],
    skus: [
      {
        id: 38,
        value: "Đặc Biệt",
        price: 45000,
        status: "AVAILABLE"
      },
      {
        id: 39,
        value: "Bình Thường",
        price: 50000,
        status: "AVAILABLE"
      }
    ]
  },
  {
    id: 22,
    name: "Cơm quê",
    basePrice: 130000,
    virtualPrice: 140000,
    status: "ACTIVE",
    categoryId: 33,
    images: [
      "http://res.cloudinary.com/diseg6gh7/image/upload/v1759939313/Ecommers/fjrtvdmu0op8oh9gszgf.png"
    ],
    variants: [
      {
        value: "Phần",
        valueOption: [
          {
            value: "Combo 2 người",
            price: 145000,
            image: ""
          },
          {
            value: "Combo 5 người",
            price: 170000,
            image: ""
          }
        ]
      }
    ],
    skus: [
      {
        id: 42,
        value: "Combo 2 người",
        price: 145000,
        status: "AVAILABLE"
      },
      {
        id: 43,
        value: "Combo 5 người",
        price: 170000,
        status: "AVAILABLE"
      }
    ]
  }
];

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

export default function MenuOrderDemo() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return mockProducts;
    return mockProducts.filter((product) => product.categoryId === selectedCategory);
  }, [selectedCategory]);

  const handleAddToCart = (productId: number, skuId: number) => {
    const product = mockProducts.find(p => p.id === productId);
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
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce-in">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* DEMO Banner */}
      <div className="bg-purple-600 text-white px-4 py-3 flex items-center justify-between animate-slide-up">
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
          loading={false}
        />
      </div>

      {/* Fixed Bottom Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg animate-slide-up">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto animate-slide-up">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Giỏ hàng</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.skuId}`} className="flex items-center gap-3 animate-fade-in">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.productName}</h3>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.skuId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.skuId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
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
