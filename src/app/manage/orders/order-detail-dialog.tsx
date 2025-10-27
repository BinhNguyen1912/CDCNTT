// 'use client';
// import React from 'react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { formatCurrency, getVietnameseOrderStatus } from '@/lib/utils';
// import { useGetOrderDetailQuery } from '@/app/queries/useOrder';
// import { Loader2 } from 'lucide-react';

// interface OrderDetailDialogProps {
//   orderId: number | undefined;
//   onClose: () => void;
// }

// export default function OrderDetailDialog({
//   orderId,
//   onClose,
// }: OrderDetailDialogProps) {
//   const {
//     data: orderDetailData,
//     isLoading,
//     error,
//   } = useGetOrderDetailQuery(orderId || 0, !!orderId);

//   const order = orderDetailData?.payload;

//   if (!orderId) return null;

//   return (
//     <Dialog open={!!orderId} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
//         <DialogHeader>
//           <DialogTitle>Chi tiết đơn hàng #{orderId}</DialogTitle>
//         </DialogHeader>

//         {isLoading && (
//           <div className="flex items-center justify-center py-8">
//             <Loader2 className="h-8 w-8 animate-spin" />
//             <span className="ml-2">Đang tải...</span>
//           </div>
//         )}

//         {error && (
//           <div className="text-center py-8">
//             <p className="text-red-500">Có lỗi xảy ra khi tải dữ liệu</p>
//             <p className="text-sm text-gray-500 mt-2">
//               {error?.message || 'Unknown error'}
//             </p>
//           </div>
//         )}

//         {order && (
//           <div className="space-y-6">
//             {/* Thông tin cơ bản */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <h3 className="font-semibold text-lg">Thông tin đơn hàng</h3>
//                 <div className="space-y-1 text-sm">
//                   <p>
//                     <span className="font-medium">ID:</span> {order.id}
//                   </p>
//                   <p>
//                     <span className="font-medium">Khách hàng:</span>{' '}
//                     {order.guest?.name || 'Khách vãng lai'}
//                   </p>
//                   <p>
//                     <span className="font-medium">Bàn:</span>{' '}
//                     {order.tableNode?.name || 'N/A'}
//                   </p>
//                   <p>
//                     <span className="font-medium">Loại:</span>
//                     <Badge variant="outline" className="ml-2">
//                       {order.type === 'AT_TABLE'
//                         ? 'Tại bàn'
//                         : order.type === 'ONLINE'
//                           ? 'Online'
//                           : 'Đặt trước'}
//                     </Badge>
//                   </p>
//                   <p>
//                     <span className="font-medium">Trạng thái:</span>
//                     <Badge
//                       variant={
//                         order.status === 'COMPLETED'
//                           ? 'default'
//                           : order.status === 'CANCELLED'
//                             ? 'destructive'
//                             : order.status === 'PENDING'
//                               ? 'secondary'
//                               : 'outline'
//                       }
//                       className="ml-2"
//                     >
//                       {getVietnameseOrderStatus(order.status)}
//                     </Badge>
//                   </p>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <h3 className="font-semibold text-lg">Thông tin thanh toán</h3>
//                 <div className="space-y-1 text-sm">
//                   <p>
//                     <span className="font-medium">Phương thức:</span>{' '}
//                     {order.payment.method || 'Chưa chọn'}
//                   </p>
//                   <p>
//                     <span className="font-medium">Số tiền:</span>{' '}
//                     {formatCurrency(Number(order.payment.amount))}
//                   </p>
//                   <p>
//                     <span className="font-medium">Trạng thái:</span>
//                     <Badge
//                       variant={
//                         order.payment.status === 'SUCCESS'
//                           ? 'default'
//                           : order.payment.status === 'PENDING'
//                             ? 'secondary'
//                             : 'destructive'
//                       }
//                       className="ml-2"
//                     >
//                       {order.payment.status === 'SUCCESS'
//                         ? 'Đã thanh toán'
//                         : order.payment.status === 'PENDING'
//                           ? 'Chờ thanh toán'
//                           : 'Thất bại'}
//                     </Badge>
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Danh sách món ăn */}
//             <div>
//               <h3 className="font-semibold text-lg mb-4">Danh sách món ăn</h3>
//               <div className="rounded-md border">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Món ăn</TableHead>
//                       <TableHead>Phiên bản</TableHead>
//                       <TableHead className="text-center">Số lượng</TableHead>
//                       <TableHead className="text-right">Đơn giá</TableHead>
//                       <TableHead className="text-right">Thành tiền</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {order.items?.map((item) => (
//                       <TableRow key={item.id}>
//                         <TableCell>
//                           <div className="flex items-center gap-3">
//                             {item.image && (
//                               <img
//                                 src={item.image}
//                                 alt={item.productName}
//                                 className="w-12 h-12 rounded object-cover"
//                               />
//                             )}
//                             <div>
//                               <p className="font-medium">{item.productName}</p>
//                               <p className="text-sm text-muted-foreground">
//                                 ID: {item.productId}
//                               </p>
//                             </div>
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <Badge variant="outline">{item.skuValue}</Badge>
//                         </TableCell>
//                         <TableCell className="text-center">
//                           {item.quantity}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           {formatCurrency(item.skuPrice)}
//                         </TableCell>
//                         <TableCell className="text-right font-medium">
//                           {formatCurrency(item.quantity * item.skuPrice)}
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>

//               {/* Tổng tiền */}
//               <div className="mt-4 flex justify-end">
//                 <div className="text-right">
//                   <p className="text-lg font-semibold">
//                     Tổng tiền:{' '}
//                     {formatCurrency(
//                       order.items?.reduce(
//                         (sum, item) => sum + item.quantity * item.skuPrice,
//                         0,
//                       ) || 0,
//                     )}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Thông tin thời gian */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//               <div>
//                 <p>
//                   <span className="font-medium">Ngày tạo:</span>{' '}
//                   {new Date(order.createdAt).toLocaleString('vi-VN')}
//                 </p>
//                 <p>
//                   <span className="font-medium">Cập nhật lần cuối:</span>{' '}
//                   {new Date(order.updatedAt).toLocaleString('vi-VN')}
//                 </p>
//               </div>
//               <div>
//                 {order.createdBy && (
//                   <p>
//                     <span className="font-medium">Người tạo:</span>{' '}
//                     {order.createdBy.name}
//                   </p>
//                 )}
//                 {order.updatedBy && (
//                   <p>
//                     <span className="font-medium">Người cập nhật:</span>{' '}
//                     {order.updatedBy.name}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="flex justify-end gap-2 pt-4 border-t">
//               <Button variant="outline" onClick={onClose}>
//                 Đóng
//               </Button>
//               <Button
//                 onClick={() => {
//                   // TODO: Implement edit order functionality
//                   console.log('Edit order:', order.id);
//                 }}
//               >
//                 Chỉnh sửa
//               </Button>
//             </div>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }
