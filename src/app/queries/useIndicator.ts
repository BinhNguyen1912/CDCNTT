import indicatorApiRequest from '@/apiRequest/indicator';
import { DashboardIndicatorQueryParamsType } from '@/app/schemaValidations/indicator.schema';
import { useQuery } from '@tanstack/react-query';

export const useDashBoardIndicators = (
  queryParams: DashboardIndicatorQueryParamsType
) => {
  return useQuery({
    queryKey: ['indicators', queryParams],
    queryFn: () => indicatorApiRequest.getDashboardIndicators(queryParams),
  });
};
