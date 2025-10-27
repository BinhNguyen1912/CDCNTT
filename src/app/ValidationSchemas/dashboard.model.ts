import z from 'zod';

export interface DashboardIndicatorType {
  revenue: number;
  guestCount: number;
  orderCount: number;
  servingTableCount: number;
  productIndicator: ProductIndicatorType[];
  revenueByDate: RevenueByDateType[];
}

export interface ProductIndicatorType {
  id: number;
  name: string;
  basePrice: number;
  virtualPrice: number;
  images: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  successOrders: number;
}

export interface RevenueByDateType {
  date: string;
  revenue: number;
}

export const DashboardIndicatorQuerySchema = z.object({
  fromDate: z.string(),
  toDate: z.string(),
});

export const ProductIndicatorSchema = z.object({
  id: z.number(),
  name: z.string(),
  basePrice: z.number(),
  virtualPrice: z.number(),
  images: z.array(z.string()),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  successOrders: z.number(),
});

export const RevenueByDateSchema = z.object({
  date: z.string(),
  revenue: z.number(),
});

export const DashboardIndicatorResponseSchema = z.object({
  revenue: z.number(),
  guestCount: z.number(),
  orderCount: z.number(),
  servingTableCount: z.number(),
  productIndicator: z.array(ProductIndicatorSchema),
  revenueByDate: z.array(RevenueByDateSchema),
});
