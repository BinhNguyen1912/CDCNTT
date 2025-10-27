import { z } from 'zod';

// Schema cho query parameters của dashboard indicators
export const DashboardIndicatorQueryParamsSchema = z.object({
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
});

export type DashboardIndicatorQueryParamsType = z.infer<
  typeof DashboardIndicatorQueryParamsSchema
>;

// Schema cho response của dashboard indicators
export const DashboardIndicatorDataSchema = z.object({
  revenue: z.number(),
  guestCount: z.number(),
  orderCount: z.number(),
  servingTableCount: z.number(),
  revenueByDate: z.array(
    z.object({
      date: z.string(),
      revenue: z.number(),
    }),
  ),
  dishIndicator: z.array(
    z.object({
      dishName: z.string(),
      quantity: z.number(),
      revenue: z.number(),
    }),
  ),
});

export const DashboardIndicatorResSchema = z.object({
  message: z.string(),
  data: DashboardIndicatorDataSchema,
});

export type DashboardIndicatorData = z.infer<
  typeof DashboardIndicatorDataSchema
>;
export type DashboardIndicatorResType = z.infer<
  typeof DashboardIndicatorResSchema
>;
