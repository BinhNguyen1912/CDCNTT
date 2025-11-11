// import ProductGrid from '@/components/ProductGrid';
// import Image from 'next/image';
// import { useEffect, useState } from 'react';

// interface Product {
//   id: number;
//   name: string;
//   basePrice: number;
//   virtualPrice: number;
//   variants: any[];
//   publishedAt: string;
//   images: string[];
//   skus: any[];
//   createdBy: any;
// }

// const ProductsPage = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await fetch('http://localhost:4000/product');
//         const data = await response.json();
//         setProducts(data.data);
//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const handleAddToCart = (skuId: number) => {
//     console.log('Added to cart:', skuId);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen  dark:bg-gray-900">
//         <div className="text-lg md:text-xl text-gray-800 dark:text-gray-200">
//           Đang tải sản phẩm...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen  rounded-sm dark:bg-gray-900 transition-colors duration-300">
//       <div className="min-h-screen rounded-sm transition-colors duration-300 relative">
//         <h2 className="text-center p-5 text-[30px] mb-4 font-bold">
//           Đa dạng các món ăn
//         </h2>
//         <ProductGrid products={products} onAddToCart={handleAddToCart} />
//       </div>
//     </div>
//     // </div>
//   );
// };

// export default ProductsPage;
