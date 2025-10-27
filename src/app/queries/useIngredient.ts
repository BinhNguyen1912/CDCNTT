import { ingredienrApiRequest } from '@/apiRequest/ingredient';
import { UpdateIngredientBodyType } from '@/app/ValidationSchemas/ingredient.model';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetListIngredientMutation = () => {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: () => ingredienrApiRequest.list(),
  });
};

export const useDeleteIngredientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ingredienrApiRequest.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ingredients'],
      });
    },
  });
};

export const useAddIngredientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ingredienrApiRequest.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ingredients'],
      });
    },
  });
};

export const useGetIngredient = ({
  enabled,
  id,
}: {
  id: number;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ['ingredients', id],
    queryFn: () => ingredienrApiRequest.getIngredient(id),
    enabled,
  });
};

export const useUpdateIngredientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateIngredientBodyType & { id: number }) =>
      ingredienrApiRequest.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ingredients'],
        exact: true,
      });
    },
  });
};
