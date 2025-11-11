// import dishesApiRequest from '@/apiRequest/dishes';
import productsApiRequest from '@/apiRequest/products';
import {
  GetManageProductQueryType,
  UpdateProductBodyType,
} from '@/app/ValidationSchemas/product.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetProducts = () => {
  return useQuery({
    queryKey: ['Dishes'],
    queryFn: productsApiRequest.getListProduct,
  });
};

// export const useGetDish = ({
//   enabled,
//   id,
// }: {
//   id: number;
//   enabled: boolean;
// }) => {
//   return useQuery({
//     queryKey: ['Dishes', id],
//     queryFn: () => dishesApiRequest.getDish(id),
//     enabled,
//   });
// };

export const useGetProduct = ({
  enabled,
  id,
}: {
  id: number;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApiRequest.getProduct(id),
    enabled,
  });
};
export const useGetProductListManager = (query: GetManageProductQueryType) => {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () => productsApiRequest.getProductList_Manage(query),
    staleTime: 1000 * 60, // 1 phút
  });
};
export const useAddProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productsApiRequest.create,
    onSuccess: () => {
      //onSuccess chạy sau khi API trả về thành công — ở đây bạn gọi queryClient.invalidateQueries({ queryKey: ['accounts'] })
      //invalidateQueries làm gì? Trong React Query, dữ liệu được lưu vào cache và phân loại bằng queryKey.
      //Lúc này, tất cả dữ liệu của danh sách accounts sẽ được lưu vào cache với key là ['accounts'].
      //invalidateQueries là chỉ ảnh hưởng tới những query đã được tạo bằng useQuery (hoặc queryClient.fetchQuery)
      queryClient.invalidateQueries({
        queryKey: ['products'], //React Query sẽ đánh dấu tất cả các query có key bắt đầu bằng ['Dishes'] là stale (cũ, cần làm mới).
      });
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateProductBodyType & { id: number }) =>
      productsApiRequest.update(id, body),
    onSuccess: (_, variables) => {
      // Invalidate danh sách products
      queryClient.invalidateQueries({ queryKey: ['products'] });

      // Nếu bạn có query detail của product đó, cũng invalidate luôn
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
};

// export const useDeleteDishMutation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: dishesApiRequest.delete,
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ['Dishes'],
//       });
//     },
//   });
// };

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productsApiRequest.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
    },
  });
};
