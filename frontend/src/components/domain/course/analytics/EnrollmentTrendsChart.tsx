import { LineChart } from '@/components/ui/charts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { EnrollmentTrend } from '@/services/api/analytics.api';

interface EnrollmentTrendsChartProps {
  data: EnrollmentTrend[];
  period: 'daily' | 'weekly' | 'monthly';
}

export function EnrollmentTrendsChart({ data, period }: EnrollmentTrendsChartProps) {
  const chartData = data.map((item) => ({
    name: format(new Date(item.date), period === 'daily' ? 'dd/MM' : period === 'weekly' ? 'dd/MM' : 'MM/yyyy', {
      locale: vi,
    }),
    value: item.count,
    date: item.date,
  }));

  return (
    <div className="w-full">
      <LineChart
        data={chartData}
        dataKey="value"
        name="Số lượng đăng ký"
        color="#3b82f6"
        height={300}
        showGrid
      />
    </div>
  );
}

