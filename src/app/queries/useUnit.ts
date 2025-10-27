import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unitApiRequest } from '@/apiRequest/unit';
import { unitBodyType } from '@/app/ValidationSchemas/unit.model';

export const useGetUnits = () => {
  return useQuery({
    queryKey: ['units'],
    queryFn: unitApiRequest.list,
  });
};

export const useAddUnitMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unitApiRequest.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
};
