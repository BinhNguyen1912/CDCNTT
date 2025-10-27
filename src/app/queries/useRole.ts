import { accountApiRequests } from '@/apiRequest/account';
import { roleRequestApi } from '@/apiRequest/role';
import { useQuery } from '@tanstack/react-query';

export const useGetRoleListQuery = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => roleRequestApi.list(),
  });
};
