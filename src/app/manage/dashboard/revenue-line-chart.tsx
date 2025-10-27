'use client';

import { CartesianGrid, XAxis, YAxis, Area, AreaChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { format, parse } from 'date-fns';
import { DashboardIndicatorType } from '@/app/ValidationSchemas/dashboard.model';

const chartConfig = {
  desktop: {
    label: 'Doanh thu',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function RevenueAreaChart({
  revenueByDate = [],
}: {
  revenueByDate?: DashboardIndicatorType['revenueByDate'];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Biểu đồ doanh thu
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Doanh thu theo thời gian
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            accessibilityLayer
            data={revenueByDate}
            margin={{ left: 20, right: 20, top: 20, bottom: 20 }}
            width={600}
            height={300}
          >
            {/* Grid */}
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            {/* Trục X */}
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                try {
                  const date = parse(value, 'dd/MM/yyyy', new Date());
                  return format(date, 'dd/MM');
                } catch {
                  return value;
                }
              }}
            />

            {/* Trục Y */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(1)}K`;
                }
                return value.toString();
              }}
            />

            {/* Tooltip */}
            <ChartTooltip
              cursor={{
                stroke: '#3b82f6',
                strokeDasharray: '5 5',
                strokeWidth: 2,
              }}
              content={<ChartTooltipContent indicator="line" />}
              formatter={(value, name) => [
                new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(Number(value)),
                'Doanh thu',
              ]}
            />

            {/* Định nghĩa gradient */}
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.6}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            {/* Area hiển thị doanh thu */}
            <Area
              type="monotone"
              dataKey="revenue"
              name="Doanh thu"
              stroke="var(--color-desktop)"
              strokeWidth={3}
              fill="url(#colorRevenue)"
              activeDot={{
                r: 6,
                stroke: 'var(--color-desktop)',
                strokeWidth: 2,
                fill: '#fff',
              }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
    </Card>
  );
}
