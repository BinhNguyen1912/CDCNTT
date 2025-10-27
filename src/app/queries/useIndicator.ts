import indicatorApiRequest from '@/apiRequest/indicator';
import { DashboardIndicatorQuerySchema } from '@/app/ValidationSchemas/dashboard.model';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

export const useDashBoardIndicators = (
  queryParams: z.infer<typeof DashboardIndicatorQuerySchema>,
) => {
  return useQuery({
    queryKey: ['indicators', queryParams],
    queryFn: () => indicatorApiRequest.getDashboardIndicators(queryParams),
  });
};
