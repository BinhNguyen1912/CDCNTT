// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import {
//   TableNodeBodyType,
//   TableNodeQueryType,
//   UpdateTableNodeBodyType,
// } from '@/app/SchemaModel/table-node.schema';
// import { tableNodeRequestApi } from '@/apiRequest/tableNode';

// // ---------------- LIST ----------------

// export const useListTableNode = (query?: Partial<TableNodeQueryType>) => {
//   return useQuery({
//     queryKey: ['tableNodes', query], // key kèm query để tự refetch khi query thay đổi
//     queryFn: () => tableNodeRequestApi.list(),
//     staleTime: 1000 * 60, // giữ dữ liệu 1 phút
//   });
// };

// // ---------------- DETAIL ----------------
// export const useGetTableNodeDetail = (id: number, enabled?: boolean) => {
//   return useQuery({
//     queryKey: ['tableNodes', id],
//     queryFn: () => tableNodeRequestApi.getDetail(id),
//     enabled,
//   });
// };

// // ---------------- CREATE ----------------
// export const useCreateTableNodeMutation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (data: TableNodeBodyType) => tableNodeRequestApi.create(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['tableNodes'] });
//     },
//   });
// };

// // ---------------- UPDATE ----------------
// export const useUpdateTableNodeMutation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, ...body }: UpdateTableNodeBodyType & { id: number }) =>
//       tableNodeRequestApi.put(id, body),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['tableNodes'] });
//     },
//   });
// };

// // ---------------- DELETE ----------------
// export const useDeleteTableNodeMutation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (id: number) => tableNodeRequestApi.delete(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['tableNodes'] });
//     },
//   });
// };

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tableNodeRequestApi } from '@/apiRequest/tableNode';
import {
  TableNodeBodyType,
  TableNodeQueryType,
  UpdateTableNodeBodyType,
  UpdateTableNodeBodyBatchType,
} from '@/app/ValidationSchemas/table-node.schema';

// LIST với query params (area, pagination)
export const useListTableNode = (query?: Partial<TableNodeQueryType>) => {
  return useQuery({
    queryKey: ['tableNodes', query],
    queryFn: () => tableNodeRequestApi.list(query),
    staleTime: 1000 * 60,
  });
};

// DETAIL
export const useGetTableNodeDetail = (id: number, enabled = true) =>
  useQuery({
    queryKey: ['tableNodes', id],
    queryFn: () => tableNodeRequestApi.getDetail(id),
    enabled,
  });

// CREATE
export const useCreateTableNodeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TableNodeBodyType) => tableNodeRequestApi.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tableNodes'] }),
  });
};

// UPDATE
export const useUpdateTableNodeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateTableNodeBodyType & { id: number }) =>
      tableNodeRequestApi.put(id, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tableNodes'] }),
  });
};

// DELETE
export const useDeleteTableNodeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tableNodeRequestApi.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tableNodes'] }),
  });
};

// UPDATE NHIỀU NODE (BATCH)
export const useUpdateManyTableNodeBatchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTableNodeBodyBatchType) =>
      tableNodeRequestApi.updateManyBatch(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tableNodes'] }),
  });
};

// XÓA TOÀN BỘ NODE THEO AREA
export const useDeleteAllTableNodeByAreaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (areaId: number) => tableNodeRequestApi.deleteAllByArea(areaId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tableNodes'] }),
  });
};
