'use client';

import { CartesianGrid, XAxis, YAxis, Area, AreaChart } from 'recharts';
import {
  Card,
  CardContent,
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
import { DashboardIndicatorResType } from '@/app/schemaValidations/indicator.schema';

const chartConfig = {
  desktop: {
    label: 'Doanh thu',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function RevenueAreaChart({
  revenueByDate,
}: {
  revenueByDate: DashboardIndicatorResType['data']['revenueByDate'];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Doanh thu</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={revenueByDate}
            margin={{ left: 12, right: 12 }}
          >
            {/* Grid */}
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />

            {/* Trục X */}
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(value) => {
                if (revenueByDate.length < 8) return value;
                if (revenueByDate.length < 33) {
                  const date = parse(value, 'dd/MM/yyyy', new Date());
                  return format(date, 'dd');
                }
                return '';
              }}
            />

            {/* Trục Y */}
            <YAxis />

            {/* Tooltip */}
            <ChartTooltip
              cursor={{ stroke: '#999', strokeDasharray: '5 5' }}
              content={<ChartTooltipContent indicator="line" />}
            />

            {/* Định nghĩa gradient */}
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            {/* Area hiển thị doanh thu */}
            <Area
              type="monotone"
              dataKey="revenue"
              name="Doanh thu"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              fill="url(#colorRevenue)"
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
    </Card>
  );
}
