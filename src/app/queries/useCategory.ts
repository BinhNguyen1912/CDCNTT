import categoriesApiRequest from '@/apiRequest/categories';
import { UpdateCategoryBodyType } from '@/app/ValidationSchemas/category.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApiRequest.getListCategory,
  });
};

export const useGetCategory = ({
  enabled,
  id,
}: {
  id: number;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoriesApiRequest.getCategory(id),
    enabled,
  });
};

export const useAddCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriesApiRequest.create,
    onSuccess: () => {
      //onSuccess chạy sau khi API trả về thành công — ở đây bạn gọi queryClient.invalidateQueries({ queryKey: ['accounts'] })
      //invalidateQueries làm gì? Trong React Query, dữ liệu được lưu vào cache và phân loại bằng queryKey.
      //Lúc này, tất cả dữ liệu của danh sách accounts sẽ được lưu vào cache với key là ['accounts'].
      //invalidateQueries là chỉ ảnh hưởng tới những query đã được tạo bằng useQuery (hoặc queryClient.fetchQuery)
      queryClient.invalidateQueries({
        queryKey: ['categories'], //React Query sẽ đánh dấu tất cả các query có key bắt đầu bằng ['Dishes'] là stale (cũ, cần làm mới).
      });
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateCategoryBodyType & { id: number }) =>
      categoriesApiRequest.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories'],
        exact: true,
      });
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriesApiRequest.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
    },
  });
};
