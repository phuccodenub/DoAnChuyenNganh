import { BarChart, PieChart } from '@/components/ui/charts';
import type { RatingAnalytics } from '@/services/api/analytics.api';

interface RatingDistributionChartProps {
  data: RatingAnalytics;
}

export function RatingDistributionChart({ data }: RatingDistributionChartProps) {
  const barData = [
    { name: '5 sao', value: data.ratingDistribution[5] },
    { name: '4 sao', value: data.ratingDistribution[4] },
    { name: '3 sao', value: data.ratingDistribution[3] },
    { name: '2 sao', value: data.ratingDistribution[2] },
    { name: '1 sao', value: data.ratingDistribution[1] },
  ];

  const pieData = barData.filter((item) => item.value > 0).map((item) => ({
    name: item.name,
    value: item.value,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Phân bố đánh giá</h3>
        <BarChart
          data={barData}
          dataKey="value"
          name="Số lượng"
          color="#f59e0b"
          height={250}
          showGrid
        />
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tỷ lệ đánh giá</h3>
          <PieChart
            data={pieData}
            height={250}
            colors={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']}
            showLegend
          />
        </div>
      )}
    </div>
  );
}

