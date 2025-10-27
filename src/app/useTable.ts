import { tableRequestApi } from '@/apiRequest/table';
import { UpdateTableBodyType } from '@/app/ValidationSchemas/table.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useListTable = (areaId?: number) => {
  return useQuery({
    queryKey: ['tables', areaId],
    queryFn: () => tableRequestApi.list(areaId ? { areaId } : undefined),
  });
};
export const useTableDetail = ({
  enabled,
  id,
}: {
  id: number;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ['tables', id],
    queryFn: () => tableRequestApi.getDetail(id),
    enabled,
  });
};

export const useCreateTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tableRequestApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tables'],
      });
    },
  });
};

export const useUpdateTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateTableBodyType & { id: number }) =>
      tableRequestApi.put(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tables'],
        exact: true,
      });
    },
  });
};

export const useDeleteTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tableRequestApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tables'],
      });
    },
  });
};
