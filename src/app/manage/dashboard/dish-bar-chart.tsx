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
import { DashboardIndicatorResType } from '@/app/schemaValidations/indicator.schema';
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
  dishIndicator,
}: {
  dishIndicator: Pick<
    DashboardIndicatorResType['data']['dishIndicator'][0],
    'id' | 'name' | 'successOrders'
  >[];
}) {
  const chartConfig: ChartConfig = useMemo(
    () =>
      dishIndicator.reduce((acc, item, index) => {
        acc[item.name] = {
          label: item.name,
          color: colors[index % colors.length],
        };
        return acc;
      }, {} as ChartConfig),
    [dishIndicator]
  );

  // Gắn màu cho từng item (trùng với chartConfig)
  const chartDataWithColor = useMemo(
    () =>
      dishIndicator.map((item) => ({
        ...item,
        fill: chartConfig[item.name]?.color ?? 'hsl(var(--chart-1))',
      })),
    [dishIndicator, chartConfig]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xếp hạng món ăn</CardTitle>
        <CardDescription>Được gọi nhiều nhất</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartDataWithColor}
            layout="vertical"
            margin={{ left: 0 }}
          >
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={2}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label ?? value
              }
            />
            <XAxis dataKey="successOrders" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="successOrders"
              name="Đơn thanh toán"
              layout="vertical"
              radius={5}
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
