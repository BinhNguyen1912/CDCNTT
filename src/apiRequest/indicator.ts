import {
  DashboardIndicatorQuerySchema,
  DashboardIndicatorType,
} from '@/app/ValidationSchemas/dashboard.model';
import http from '@/lib/http';
import { z } from 'zod';

const indicatorApiRequest = {
  getDashboardIndicators: (
    queryParams: z.infer<typeof DashboardIndicatorQuerySchema>,
  ) =>
    http.post<DashboardIndicatorType>('/dashboard/indicator', {
      fromDate: queryParams.fromDate,
      toDate: queryParams.toDate,
    }),
};
export default indicatorApiRequest;
