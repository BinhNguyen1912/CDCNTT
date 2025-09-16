import { accountApiRequests } from '@/apiRequest/account';
import { getProfileDetailResType } from '@/app/SchemaModel/user.schema';
import {
  AccountResType,
  GetGuestListQueryParamsType,
  UpdateEmployeeAccountBodyType,
} from '@/app/schemaValidations/account.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useMeProfile = (
  onSuccess?: (data: getProfileDetailResType) => void,
) => {
  return useQuery({
    queryKey: ['account-profile'],
    queryFn: () =>
      accountApiRequests
        .me()
        .then((res) => {
          if (onSuccess) {
            onSuccess(res.payload);
          }
          return res;
        })
        .catch((err) => {
          console.log(err);
          throw err;
        }),
  });
};

export const useUpdateMeMutation = () => {
  return useMutation({
    mutationFn: accountApiRequests.update,
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: accountApiRequests.changePassword,
  });
};

export const useGetAccountList = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: accountApiRequests.list,
  });
};

export const useGetEmployeeAccount = ({
  id,
  enabled,
}: {
  id: number;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => accountApiRequests.getEmployee(id),
    enabled,
  });
};

export const useAddEmployeeAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    //useMutation tạo mutation để gọi API thêm nhân viên (accountApiRequests.addEmployee).
    mutationFn: accountApiRequests.addEmployee,
    onSuccess: () => {
      //onSuccess chạy sau khi API trả về thành công — ở đây bạn gọi queryClient.invalidateQueries({ queryKey: ['accounts'] })
      //invalidateQueries làm gì? Trong React Query, dữ liệu được lưu vào cache và phân loại bằng queryKey.
      //Lúc này, tất cả dữ liệu của danh sách accounts sẽ được lưu vào cache với key là ['accounts'].
      //invalidateQueries là chỉ ảnh hưởng tới những query đã được tạo bằng useQuery (hoặc queryClient.fetchQuery)
      queryClient.invalidateQueries({
        queryKey: ['accounts'], //React Query sẽ đánh dấu tất cả các query có key bắt đầu bằng ['accounts'] là stale (cũ, cần làm mới).
      });
    },

    //MÔ PHỎNG
    /**
     * React Query sẽ:

      Tìm tất cả những query có key trùng hoặc bắt đầu bằng ['accounts'] trong cache.

      Đánh dấu chúng là stale.

      Nếu query đó đang active (tức là component đang mount và đang dùng useQuery với key đó) → React Query sẽ refetch ngay lập tức.

      Nếu query không active → nó sẽ chỉ refetch khi component chứa nó mount lại hoặc khi user focus lại tab (tuỳ refetchOnWindowFocus setting).
     */
  });
};

export const useUpdateEmployeeAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: UpdateEmployeeAccountBodyType & { id: number }) =>
      accountApiRequests.updateEmployee(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts'],
        exact: true,
      });
    },
  });
};

export const useDeleteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountApiRequests.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts'],
      });
    },
  });
};

export const useGetGuestListQuery = (
  queryParams: GetGuestListQueryParamsType,
) => {
  return useQuery({
    queryKey: ['guests', queryParams],
    queryFn: () => accountApiRequests.guestList(queryParams),
  });
};

export const useCreateGuest = () => {
  return useMutation({
    mutationFn: accountApiRequests.createGuest,
  });
};
