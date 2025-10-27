import { areaRequestApi } from '@/apiRequest/area';
import {
  AreaBodyType,
  AreaQueryType,
  UpdateAreaBodyType,
} from '@/app/ValidationSchemas/area.schema';
import { UpdateTableBodyType } from '@/app/ValidationSchemas/table.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useListArea = (query?: Partial<AreaQueryType>) => {
  return useQuery({
    queryKey: ['areas', query], // key có query để tự refetch khi query thay đổi
    queryFn: () => areaRequestApi.list(),
    staleTime: 1000 * 60, // giữ dữ liệu cũ khi refetch
  });
};

export const useAreaDetail = ({
  id,
  enabled,
}: {
  id: number;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ['areas', id],
    queryFn: () => areaRequestApi.getDetail(id),
    enabled,
  });
};

export const useCreateAreaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AreaBodyType) => areaRequestApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
  });
};

export const useUpdateAreaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateAreaBodyType & { id: number }) =>
      areaRequestApi.put(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'], exact: true });
    },
  });
};

export const useDeleteAreaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => areaRequestApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
  });
};
