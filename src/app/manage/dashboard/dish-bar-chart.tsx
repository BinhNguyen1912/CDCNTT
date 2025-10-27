'use client';

import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { DashboardIndicatorType } from '@/app/ValidationSchemas/dashboard.model';
import { useMemo } from 'react';

type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

// const colors = [
//   'hsl(var(--chart-1))',
//   'hsl(var(--chart-2))',
//   'hsl(var(--chart-3))',
//   'hsl(var(--chart-4))',
//   'hsl(var(--chart-5))',
// ];
const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']; // list màu
export function DishBarChart({
  productIndicator = [],
}: {
  productIndicator?: Pick<
    DashboardIndicatorType['productIndicator'][0],
    'id' | 'name' | 'successOrders'
  >[];
}) {
  const chartConfig: ChartConfig = useMemo(
    () =>
      productIndicator.reduce((acc, item, index) => {
        acc[item.name] = {
          label: item.name,
          color: colors[index % colors.length],
        };
        return acc;
      }, {} as ChartConfig),
    [productIndicator],
  );

  // Gắn màu cho từng item (trùng với chartConfig)
  const chartDataWithColor = useMemo(
    () =>
      productIndicator.map((item) => ({
        ...item,
        fill: chartConfig[item.name]?.color ?? 'hsl(var(--chart-1))',
      })),
    [productIndicator, chartConfig],
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Xếp hạng món ăn</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Top {productIndicator.length} món được gọi nhiều nhất
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={chartDataWithColor}
            layout="vertical"
            margin={{ left: 80, right: 20, top: 20, bottom: 20 }}
            width={400}
            height={300}
          >
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              width={70}
              tickFormatter={(value) => {
                const label =
                  chartConfig[value as keyof typeof chartConfig]?.label ??
                  value;
                return label.length > 12
                  ? label.substring(0, 12) + '...'
                  : label;
              }}
            />
            <XAxis
              dataKey="successOrders"
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
              formatter={(value, name) => [value, 'Đơn hàng']}
            />
            <Bar
              dataKey="successOrders"
              name="Đơn thanh toán"
              layout="vertical"
              radius={[0, 4, 4, 0]}
            >
              {chartDataWithColor.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm" />
    </Card>
  );
}
